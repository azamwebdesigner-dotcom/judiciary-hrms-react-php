import React, { createContext, useContext, useState, useEffect } from 'react';
import { Headquarter, Tehsil, Designation, Category, Unit, Qualification } from '../types';
import { api } from '../services/api';

interface MasterDataContextType {
  // All data including inactive
  allHeadquarters: Headquarter[];
  allTehsils: Tehsil[];

  // Filtered data (only active)
  headquarters: Headquarter[];
  tehsils: Tehsil[];
  designations: Designation[];
  categories: Category[];
  units: Unit[];
  qualifications: Qualification[];

  // Functions with cascading logic
  addHeadquarter: (hq: Headquarter) => Promise<void>;
  updateHeadquarter: (hq: Headquarter) => Promise<void>;
  deleteHeadquarter: (id: string) => Promise<boolean>;
  toggleHeadquarterStatus: (id: string, status: 'Active' | 'Inactive') => Promise<void>;

  addTehsil: (tehsil: Tehsil) => Promise<void>;
  updateTehsil: (tehsil: Tehsil) => Promise<void>;
  deleteTehsil: (id: string) => Promise<boolean>;
  toggleTehsilStatus: (id: string, status: 'Active' | 'Inactive') => Promise<void>;

  // Designation methods
  addDesignation: (designation: Omit<Designation, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => Promise<Designation>;
  updateDesignation: (id: string, updates: Partial<Designation>) => Promise<Designation>;
  deleteDesignation: (id: string) => Promise<boolean>;

  // Category methods
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<boolean>;

  // Unit methods
  addUnit: (unit: Omit<Unit, 'id'>) => Promise<Unit>;
  updateUnit: (id: string, updates: Partial<Unit>) => Promise<Unit>;
  deleteUnit: (id: string) => Promise<boolean>;

  // Qualification methods
  addQualification: (qualification: Omit<Qualification, 'id'>) => Promise<Qualification>;
  updateQualification: (id: string, updates: Partial<Qualification>) => Promise<Qualification>;
  deleteQualification: (id: string) => Promise<boolean>;

  // Get filtered tehsils by HQ
  getTehsilsByHQ: (hqId: string) => Tehsil[];
  getActiveTehsilsByHQ: (hqId: string) => Tehsil[];

  isLoading: boolean;
  error: string | null;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

export const MasterDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allHeadquarters, setAllHeadquarters] = useState<Headquarter[]>([]);
  const [allTehsils, setAllTehsils] = useState<Tehsil[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtered data (only active)
  const headquarters = allHeadquarters.filter(hq => hq.status === 'Active');
  const tehsils = allTehsils.filter(tehsil => tehsil.status === 'Active');

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // console.log('🔄 Fetching master data...');
      const data = await api.getMasterData();
      // console.log('✅ Master data received:', data);

      if (data) {
        // Normalize master data: ensure ids and foreign keys are strings and trimmed
        setAllHeadquarters((data.headquarters || []).map(h => ({
          ...h,
          id: String(h.id).trim(),
          title: h.title,
          status: (h.status || 'Active') as any
        })));

        setAllTehsils((data.tehsils || []).map(t => ({
          ...t,
          id: String(t.id).trim(),
          hqId: String((t as any).hqId || '').trim(),
          title: t.title,
          status: (t.status || 'Active') as any
        })));

        setDesignations((data.designations || []).map(d => ({
          ...d,
          id: String(d.id).trim(),
          title: d.title
        })));

        setCategories((data.categories || []).map(c => ({
          ...c,
          id: String(c.id).trim(),
          title: c.title,
          status: (c.status || 'Active') as any
        })));

        setUnits((data.units || []).map(u => ({
          ...u,
          id: String(u.id).trim(),
          categoryId: String((u as any).categoryId || '').trim(),
          title: u.title,
          status: (u.status || 'Active') as any
        })));

        setQualifications((data.qualifications || []).map(q => ({
          ...q,
          id: String(q.id).trim()
        })));
      }
    } catch (error) {
      console.error("❌ Failed to load master data", error);
      setError(error instanceof Error ? error.message : 'Failed to load data');

      // Set empty arrays as fallback
      setAllHeadquarters([]);
      setAllTehsils([]);
      setDesignations([]);
      setCategories([]);
      setUnits([]);
      setQualifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper functions
  const getTehsilsByHQ = (hqId: string): Tehsil[] => {
    return allTehsils.filter(tehsil => tehsil.hqId === hqId);
  };

  const getActiveTehsilsByHQ = (hqId: string): Tehsil[] => {
    return allTehsils.filter(tehsil => tehsil.hqId === hqId && tehsil.status === 'Active');
  };


  // Enhanced HQ functions with cascading logic
  const toggleHeadquarterStatus = async (id: string, status: 'Active' | 'Inactive') => {
    try {
      const hq = allHeadquarters.find(h => h.id === id);
      if (!hq) throw new Error('Headquarter not found');

      // Update HQ status
      await api.updateHeadquarter({ ...hq, status });

      // If inactivating HQ, also inactivate all its tehsils
      if (status === 'Inactive') {
        const hqTehsils = allTehsils.filter(t => t.hqId === id && t.status === 'Active');
        for (const tehsil of hqTehsils) {
          await api.updateTehsil({ ...tehsil, status: 'Inactive' });
        }
      }

      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to toggle HQ status:', error);
      throw error;
    }
  };

  const checkHQHasEmployees = async (hqId: string): Promise<boolean> => {
    try {
      // This would need a new API endpoint to check employee count
      // For now, return false as placeholder
      return false;
    } catch (error) {
      console.error('Failed to check employees:', error);
      return true; // Assume has employees to prevent deletion
    }
  };

  const checkTehsilHasEmployees = async (tehsilId: string): Promise<boolean> => {
    try {
      // Placeholder - would need API endpoint
      return false;
    } catch (error) {
      console.error('Failed to check tehsil employees:', error);
      return true;
    }
  };

  const deleteHeadquarter = async (id: string): Promise<boolean> => {
    try {
      // Check if HQ has active employees before deletion
      const hasEmployees = await checkHQHasEmployees(id);
      if (hasEmployees) {
        alert('Cannot delete headquarters because it has active employees. Please reassign them first.');
        return false;
      }

      // Soft delete HQ
      const hq = allHeadquarters.find(h => h.id === id);
      if (hq) {
        await api.updateHeadquarter({ ...hq, status: 'Inactive' });
      }

      // Soft delete all associated tehsils
      const hqTehsils = allTehsils.filter(t => t.hqId === id);
      for (const tehsil of hqTehsils) {
        await api.updateTehsil({ ...tehsil, status: 'Inactive' });
      }

      await fetchData();
      return true;
    } catch (error) {
      console.error('Failed to delete HQ:', error);
      throw error;
    }
  };

  // Enhanced tehsil functions
  const toggleTehsilStatus = async (id: string, status: 'Active' | 'Inactive') => {
    try {
      const tehsil = allTehsils.find(t => t.id === id);
      if (!tehsil) return;

      // Check if HQ is active when activating tehsil
      if (status === 'Active') {
        const hq = allHeadquarters.find(h => h.id === tehsil.hqId);
        if (hq?.status !== 'Active') {
          alert('Cannot activate tehsil because its headquarters is inactive.');
          return;
        }
      }

      await api.updateTehsil({ ...tehsil, status });
      await fetchData();
    } catch (error) {
      console.error('Failed to toggle tehsil status:', error);
      throw error;
    }
  };

  const deleteTehsil = async (id: string): Promise<boolean> => {
    try {
      // Check if tehsil has active employees
      const hasEmployees = await checkTehsilHasEmployees(id);
      if (hasEmployees) {
        alert('Cannot delete tehsil because it has active employees. Please reassign them first.');
        return false;
      }

      const tehsil = allTehsils.find(t => t.id === id);
      if (tehsil) {
        await api.updateTehsil({ ...tehsil, status: 'Inactive' });
      }

      await fetchData();
      return true;
    } catch (error) {
      console.error('Failed to delete tehsil:', error);
      throw error;
    }
  };

  // Handle response function
  const handleResponse = async (apiCall: Promise<any>, successMessage?: string) => {
    try {
      await apiCall;
      await fetchData();
      // console.log('✅', successMessage);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Could not complete operation';
      console.error('❌ System Error:', error);
      alert(errorMsg);
      throw error;
    }
  };

  // Other functions
  const addHeadquarter = async (hq: Headquarter) =>
    await handleResponse(api.addHeadquarter(hq), "Headquarter added successfully");

  const updateHeadquarter = async (hq: Headquarter) =>
    await handleResponse(api.updateHeadquarter(hq), "Headquarter updated successfully");

  const addTehsil = async (tehsil: Tehsil) =>
    await handleResponse(api.addTehsil(tehsil), "Tehsil added successfully");

  const updateTehsil = async (tehsil: Tehsil) =>
    await handleResponse(api.updateTehsil(tehsil), "Tehsil updated successfully");

  // Designation methods
  const addDesignation = async (designation: Omit<Designation, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => {
    try {
      const newDesignation = await api.addDesignation({
        ...designation,
        status: designation.status || 'Active',
        bpsRange: '1-22' // Default BPS range
      });
      setDesignations(prev => [...prev, newDesignation] as Designation[]);
      return newDesignation;
    } catch (error) {
      console.error('Failed to add designation:', error);
      throw error;
    }
  };

  const updateDesignation = async (id: string, updates: Partial<Designation>) => {
    try {
      const existing = designations.find(d => String(d.id) === String(id));
      if (!existing) throw new Error('Designation not found');
      const updatedDesignation = { ...existing, ...updates };
      const updated = await api.updateDesignation(updatedDesignation);
      setDesignations(prev =>
        prev.map(des => String(des.id) === String(id) ? updated : des)
      );
      return updated;
    } catch (error) {
      console.error('Failed to update designation:', error);
      throw error;
    }
  };

  const deleteDesignation = async (id: string): Promise<boolean> => {
    try {
      await api.deleteDesignation(id);
      setDesignations(prev => prev.filter(des => String(des.id) !== String(id)));
      return true;
    } catch (error) {
      console.error('Failed to delete designation:', error);
      return false;
    }
  };

  // Category methods
  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const newCategory = await api.addCategory({
        ...category,
        status: category.status || 'Active'
      });
      setCategories(prev => [...prev, newCategory] as Category[]);
      return newCategory;
    } catch (error) {
      console.error('Failed to add category:', error);
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const existing = categories.find(c => String(c.id) === String(id));
      if (!existing) throw new Error('Category not found');
      const updatedCategory = { ...existing, ...updates };
      const updated = await api.updateCategory(updatedCategory);
      setCategories(prev =>
        prev.map(cat => String(cat.id) === String(id) ? updated : cat)
      );
      return updated;
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      await api.deleteCategory(id);
      setCategories(prev => prev.filter(cat => String(cat.id) !== String(id)));
      return true;
    } catch (error) {
      console.error('Failed to delete category:', error);
      return false;
    }
  };

  // Unit methods
  const addUnit = async (unit: Omit<Unit, 'id'>) => {
    try {
      const newUnit = await api.addUnit({
        categoryId: unit.categoryId,
        title: unit.title,
        level: unit.level || 1,
        status: unit.status || 'Active'
      });
      setUnits(prev => [...prev, newUnit] as Unit[]);
      return newUnit;
    } catch (error) {
      console.error('Failed to add unit:', error);
      throw error;
    }
  };

  const updateUnit = async (id: string, updates: Partial<Unit>) => {
    try {
      const existing = units.find(u => String(u.id) === String(id));
      if (!existing) throw new Error('Unit not found');
      const updatedUnit = { ...existing, ...updates };
      const updated = await api.updateUnit(updatedUnit);
      setUnits(prev =>
        prev.map(unit => String(unit.id) === String(id) ? updated : unit)
      );
      return updated;
    } catch (error) {
      console.error('Failed to update unit:', error);
      throw error;
    }
  };

  const deleteUnit = async (id: string): Promise<boolean> => {
    try {
      await api.deleteUnit(id);
      setUnits(prev => prev.filter(unit => String(unit.id) !== String(id)));
      return true;
    } catch (error) {
      console.error('Failed to delete unit:', error);
      return false;
    }
  };

  // Qualification methods
  const addQualification = async (qualification: Omit<Qualification, 'id'>) => {
    try {
      const newQualification = await api.addQualification({
        degreeTitle: qualification.degreeTitle,
        level: qualification.level || 1,
        status: qualification.status || 'Active'
      });
      setQualifications(prev => [...prev, newQualification] as Qualification[]);
      return newQualification;
    } catch (error) {
      console.error('Failed to add qualification:', error);
      throw error;
    }
  };

  const updateQualification = async (id: string, updates: Partial<Qualification>) => {
    try {
      const existing = qualifications.find(q => String(q.id) === String(id));
      if (!existing) throw new Error('Qualification not found');
      const updatedQualification = { ...existing, ...updates };
      const updated = await api.updateQualification(updatedQualification);
      setQualifications(prev =>
        prev.map(qual => String(qual.id) === String(id) ? updated : qual)
      );
      return updated;
    } catch (error) {
      console.error('Failed to update qualification:', error);
      throw error;
    }
  };

  const deleteQualification = async (id: string): Promise<boolean> => {
    try {
      await api.deleteQualification(id);
      setQualifications(prev => prev.filter(qual => String(qual.id) !== String(id)));
      return true;
    } catch (error) {
      console.error('Failed to delete qualification:', error);
      return false;
    }
  };

  return (
    <MasterDataContext.Provider value={{
      allHeadquarters,
      allTehsils,
      headquarters,
      tehsils,
      designations,
      categories,
      units,
      qualifications,
      addHeadquarter,
      updateHeadquarter,
      deleteHeadquarter,
      toggleHeadquarterStatus,
      addTehsil,
      updateTehsil,
      deleteTehsil,
      toggleTehsilStatus,
      getTehsilsByHQ,
      getActiveTehsilsByHQ,
      addDesignation,
      updateDesignation,
      deleteDesignation,
      addCategory,
      updateCategory,
      deleteCategory,
      addUnit,
      updateUnit,
      deleteUnit,
      addQualification,
      updateQualification,
      deleteQualification,
      isLoading,
      error
    }}>
      {children}
    </MasterDataContext.Provider>
  );
};

// Fix the export - we were missing this!
export const useMasterData = () => {
  const context = useContext(MasterDataContext);
  if (context === undefined) {
    throw new Error('useMasterData must be used within a MasterDataProvider');
  }
  return context;
};