import React, { useState, useEffect, Fragment } from 'react';
import toast from 'react-hot-toast';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import LocationPicker from '../../components/Map/LocationPicker';

import {
  Plus, Search, TowerControl as Tower, Building2,
  Trash2, Edit, Eye, Save, X, ChevronRight, ChevronDown,
  ChevronLeft, LayoutGrid, List, CheckCircle2, AlertCircle,
  ArrowLeft, Lock, DollarSign, Home, Map as MapIcon, Store, Briefcase, ShoppingBag, Box, Car, RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { liveGroupDynamicAPI } from '../../services/api';
import TwoDView from '../../pages/Exhibition/TwoDView'; // Import the 2D View component
import AdminUnitEditModal from './AdminUnitEditModal';
import './AdminLiveGrouping.css';

const PROPERTY_TYPES = [
  { id: 'apartment', label: 'Flat / Apartments', icon: Building2, desc: 'Multi-story residential buildings' },
  { id: 'bungalow', label: 'Bungalow', icon: Home, desc: 'Individual luxury houses' },
  { id: 'twin_villa', label: 'Twin Villa', icon: Box, desc: 'Two identical houses sharing a wall' },
  { id: 'plot', label: 'Land / Plot', icon: MapIcon, desc: 'Open land and sectors' },
  { id: 'mixed_use', label: 'Mixed Use Complex', icon: LayoutGrid, desc: 'Commercial + Residential projects' },
  { id: 'commercial', label: 'Commercial', icon: Store, desc: 'Shops, Offices & Showrooms' }
];

const AdminLiveGrouping = () => {

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // View Mode State
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'detail'
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectHierarchy, setProjectHierarchy] = useState(null);

  // Admin Action Modal State
  const [showUnitActionModal, setShowUnitActionModal] = useState(false);
  const [showUnitEditModal, setShowUnitEditModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [projectData, setProjectData] = useState({
    title: '',
    developer: '',
    location: '',
    latitude: null,
    longitude: null,
    map_address: '',
    description: '',
    original_price: '',
    group_price: '',
    discount: '',
    savings: '',
    type: '', // Empty to force selection in Step 1
    min_buyers: '',
    area: '',
    possession: '',
    rera_number: '',
    // New optional fields
    project_name: '',
    builder_name: '',
    property_type: '',
    unit_configuration: '',
    project_level: '',
    // Offer
    offer_type: '',
    discount_percentage: '',
    discount_label: '',
    offer_expiry_datetime: '',

    // Pricing
    regular_price_per_sqft: '',
    regular_price_per_sqft_max: '',
    group_price_per_sqft: '',
    group_price_per_sqft_max: '',
    price_unit: 'sq ft',
    currency: 'INR',
    regular_total_price: '',
    discounted_total_price_min: '',
    discounted_total_price_max: '',
    total_savings_min: '',
    total_savings_max: '',
    regular_price_min: '',
    regular_price_max: '',
    layout_columns: '',
    layout_rows: '',
    road_width: '',
    plot_gap: '',
    plot_size_width: '',
    plot_size_depth: '',
    // Commercial specific
    orientation: '',
    parking_type: 'Front',
    parking_slots: '',
    entry_points: '',
    total_units: '',
    commercial_floor_count: 1,
    // Multi-property support
    property_types: [], // For mixed_use
    property_configs: {} // Configs for each selected type
  });


  // Multi-property state
  const [typeTowers, setTypeTowers] = useState({}); // { [type]: [ { name, floors, ... } ] }
  const [typeUnits, setTypeUnits] = useState({});   // { [type]: { [towerIdx]: { [floorNum]: [units] } } }



  // Hierarchy is now derived or managed per type in typeTowers/typeUnits


  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [brochureFile, setBrochureFile] = useState(null);
  const [brochurePreview, setBrochurePreview] = useState('');

  // -- Global Defaults Enhancement --
  const [globalUnitDefaults, setGlobalUnitDefaults] = useState({
    unitType: 'Flat',
    sbua: 1500,
    carpetArea: 1200,
    baseRate: 5000,
    discountRate: 4500
  });

  // Collapsible Sections State
  const [collapsedTowers, setCollapsedTowers] = useState([]); // Array of tower indices
  const [collapsedFloors, setCollapsedFloors] = useState({}); // Object keyed by "towerIdx-floorNum"
  const [isGlobalDefaultsCollapsed, setIsGlobalDefaultsCollapsed] = useState(false);

  const toggleTowerCollapse = (towerIdx) => {
    setCollapsedTowers(prev =>
      prev.includes(towerIdx) ? prev.filter(idx => idx !== towerIdx) : [...prev, towerIdx]
    );
  };

  const toggleFloorCollapse = (towerIdx, floorNum) => {
    const key = `${towerIdx}-${floorNum}`;
    setCollapsedFloors(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const initPropertyTypeState = (type) => {
    setProjectData(prev => {
      if (prev.property_configs[type]) return prev;
      return {
        ...prev,
        property_configs: {
          ...prev.property_configs,
          [type]: {
            layout_columns: type === 'commercial' ? 5 : (type === 'plot' ? 4 : 1),
            layout_rows: type === 'plot' ? 5 : 1,
            plot_size_width: 30,
            plot_size_depth: 40,
            road_width: 60,
            plot_gap: 0,
            parking_type: 'Front',
            commercial_floor_count: 1
          }
        }
      };
    });

    setTypeTowers(prev => {
      if (prev[type]) return prev;
      return {
        ...prev,
        [type]: [{
          name: `${getLabel(type, 'parent')} 1`,
          floors: type === 'apartment' ? 10 : 0,
          unitsPerFloor: 4,
          layout_columns: type === 'plot' ? 4 : 1,
          layout_rows: type === 'plot' ? 5 : 1,
          total_bungalows: (type === 'bungalow' || type === 'twin_villa') ? 10 : 0
        }]
      };
    });
  };

  const deletePropertyTypeState = (type) => {
    setProjectData(prev => {
      const nextConfigs = { ...prev.property_configs };
      delete nextConfigs[type];
      return { ...prev, property_configs: nextConfigs };
    });
    setTypeTowers(prev => {
      const nextTowers = { ...prev };
      delete nextTowers[type];
      return nextTowers;
    });
    setTypeUnits(prev => {
      const nextUnits = { ...prev };
      delete nextUnits[type];
      return nextUnits;
    });
    setProjectData(prev => {
      const nextConfigs = { ...prev.property_configs };
      delete nextConfigs[type];
      return { ...prev, property_configs: nextConfigs };
    });
  };

  const generateFlatLabels = (count) => {
    const labels = [];
    for (let i = 0; i < count; i++) {
      labels.push(`Flat ${String.fromCharCode(65 + i)}`);
    }
    return labels;
  };

  // Validation Logic
  const getWizardSteps = () => {
    return [
      { id: 1, label: 'Type' },
      { id: 2, label: 'Basics' },
      { id: 3, label: 'Hierarchy' },
      { id: 4, label: 'Configuration' },
      { id: 5, label: 'Summary' }
    ];
  };

  const validateWizardStep = (step) => {
    if (step === 1) return !!projectData.type;

    if (step === 2) return true;

    if (step === 3) {
      if (projectData.property_types.length === 0) return false;
      return projectData.property_types.every(typeId => {
        if (typeId === "commercial") {
          const config = projectData.property_configs.commercial || {};
          return !!config.total_units;
        }
        return (typeTowers[typeId] || []).length > 0;
      });
    }

    if (step === 4) return true;

    return true;
  };;

  useEffect(() => {
    fetchProjects();
  }, []);



  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await liveGroupDynamicAPI.getAll();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Fetch projects error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (locData) => {
    setProjectData(prev => ({
      ...prev,
      location: locData.address,
      latitude: locData.lat,
      longitude: locData.lng,
      map_address: locData.address
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleBrochureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBrochureFile(file);
      setBrochurePreview(file.name);
    }
  };

  const handleCreateProject = async () => {
    try {
      setSaving(true);

      if (!projectData.min_buyers) {
        alert('Please specify Minimum Buyers');
        setSaving(false);
        return;
      }

      // --- ATOMIC SAVE LOGIC ---
      let hierarchy = [];
      let property_configs = { ...projectData.property_configs };

      // 1. Handle Commercial Component
      const isCommercialSelected = projectData.property_types.includes('commercial');

      if (isCommercialSelected) {
        const config = property_configs.commercial || {};
        const totalUnits = parseInt(config.total_units) || 0;
        const cols = parseInt(config.layout_columns) || 1;
        const compiledUnits = [];

        for (let i = 1; i <= totalUnits; i++) {
          const unitArea = (parseFloat(config.plot_size_width) * parseFloat(config.plot_size_depth)) || 0;
          compiledUnits.push({
            unit_number: `C-${i}`,
            unit_type: 'Commercial',
            floor_number: 0,
            area: unitArea,
            price: (unitArea * (parseFloat(projectData.regular_price_per_sqft) || 0)) || 0,
            price_per_sqft: parseFloat(projectData.regular_price_per_sqft) || 0,
            plot_width: parseFloat(config.plot_size_width) || null,
            plot_depth: parseFloat(config.plot_size_depth) || null,
            status: 'available'
          });
        }

        hierarchy.push({
          tower_name: 'Commercial Block',
          property_type: 'commercial',
          total_floors: parseInt(config.commercial_floor_count) || 1,
          layout_columns: cols,
          layout_rows: Math.ceil(totalUnits / cols),
          units: compiledUnits
        });
      }

      // 2. Handle Hierarchy Components (Apartment, Bungalow, Twin Villa, Plot)
      const hierarchyTypes = projectData.property_types.filter(t => t !== 'commercial');

      for (const type of hierarchyTypes) {
        const towers = typeTowers[type] || [];
        const unitsData = typeUnits[type] || {};

        for (let idx = 0; idx < towers.length; idx++) {
          const tower = towers[idx];
          const towerConfig = unitsData[idx] || {};
          const compiledUnits = [];

          for (const floorNum of Object.keys(towerConfig)) {
            if (!towerConfig[floorNum]) continue;

            for (const unit of towerConfig[floorNum]) {
              let uploadedImageUrl = unit.unit_image_url || null;
              if (unit.unit_image_file) {
                try {
                  const uploadRes = await liveGroupDynamicAPI.uploadUnitImage(unit.unit_image_file);
                  uploadedImageUrl = uploadRes.imageUrl;
                } catch (uploadErr) {
                  console.error("Unit image upload failed:", uploadErr);
                }
              }

              // Strict unit_type assignment to ensure 3D mapping works
              let finalUnitType = unit.unit_type;
              if (!finalUnitType || finalUnitType === 'Flat') {
                if (type === 'apartment') finalUnitType = 'Apartment';
                else if (type === 'plot') finalUnitType = 'Plot';
                else if (type === 'commercial') finalUnitType = 'Commercial';
                else if (type === 'twin_villa') finalUnitType = 'Twin Villa';
                else finalUnitType = 'Bungalow';
              }

              const sanitizedUnit = {
                ...unit,
                unit_type: finalUnitType,
                floor_number: parseInt(floorNum),
                area: parseFloat(unit.area) || 0,
                carpet_area: parseFloat(unit.carpet_area) || 0,
                super_built_up_area: parseFloat(unit.super_built_up_area) || 0,
                price: parseFloat(unit.price) || 0,
                price_per_sqft: parseFloat(unit.price_per_sqft) || 0,
                discount_price_per_sqft: (unit.discount_price_per_sqft) ? parseFloat(unit.discount_price_per_sqft) : null,
                plot_width: (unit.plot_width) ? parseFloat(unit.plot_width) : null,
                plot_depth: (unit.plot_depth) ? parseFloat(unit.plot_depth) : null,
                unit_image_url: uploadedImageUrl
              };

              delete sanitizedUnit.unit_image_file;
              delete sanitizedUnit.localImagePreview;
              compiledUnits.push(sanitizedUnit);
            }
          }

          hierarchy.push({
            tower_name: tower.name || `${type.charAt(0).toUpperCase() + type.slice(1)} Block ${idx + 1}`,
            property_type: type,
            total_floors: parseInt(tower.floors) || (['bungalow', 'twin_villa', 'plot'].includes(type) ? 1 : 0),
            layout_columns: tower.layout_columns || null,
            layout_rows: tower.layout_rows || null,
            units: compiledUnits
          });
        }
      }

      // Sanitize projectData
      const sanitizeNumeric = (val) => (val === '' || val === null || val === undefined) ? null : val;

      const sanitizedProjectData = {
        ...projectData,
        property_configs: property_configs,
        min_buyers: sanitizeNumeric(projectData.min_buyers),
        original_price: sanitizeNumeric(projectData.original_price),
        group_price: sanitizeNumeric(projectData.group_price),
        discount: sanitizeNumeric(projectData.discount),
        savings: sanitizeNumeric(projectData.savings),
        area: sanitizeNumeric(projectData.area),
        discount_percentage: sanitizeNumeric(projectData.discount_percentage),
        regular_price_per_sqft: sanitizeNumeric(projectData.regular_price_per_sqft),
        regular_price_per_sqft_max: sanitizeNumeric(projectData.regular_price_per_sqft_max),
        group_price_per_sqft: sanitizeNumeric(projectData.group_price_per_sqft),
        group_price_per_sqft_max: sanitizeNumeric(projectData.group_price_per_sqft_max),
        regular_total_price: sanitizeNumeric(projectData.regular_total_price),
        discounted_total_price_min: sanitizeNumeric(projectData.discounted_total_price_min),
        discounted_total_price_max: sanitizeNumeric(projectData.discounted_total_price_max),
        regular_price_min: sanitizeNumeric(projectData.regular_price_min),
        regular_price_max: sanitizeNumeric(projectData.regular_price_max),
        total_savings_min: sanitizeNumeric(projectData.total_savings_min),
        total_savings_max: sanitizeNumeric(projectData.total_savings_max),
        layout_columns: sanitizeNumeric(projectData.layout_columns),
        layout_rows: sanitizeNumeric(projectData.layout_rows),
        road_width: sanitizeNumeric(projectData.road_width),
        plot_gap: sanitizeNumeric(projectData.plot_gap),
        plot_size_width: sanitizeNumeric(projectData.plot_size_width),
        plot_size_depth: sanitizeNumeric(projectData.plot_size_depth),
        parking_slots: sanitizeNumeric(projectData.parking_slots),
      };

      await liveGroupDynamicAPI.createProjectWithHierarchy(sanitizedProjectData, hierarchy, imageFiles, brochureFile);

      toast.success('Project and complete hierarchy created successfully!');
      setShowWizard(false);
      setWizardStep(1);
      fetchProjects();
    } catch (error) {
      console.error('Wizard submission error:', error);
      alert('Failed to create project: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project and all its towers/units? This cannot be undone.')) return;
    try {
      await liveGroupDynamicAPI.deleteProject(id);
      fetchProjects();
    } catch (error) {
      alert('Delete failed: ' + error.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await liveGroupDynamicAPI.updateProjectStatus(id, status);
      fetchProjects();
    } catch (error) {
      alert('Status update failed: ' + error.message);
    }
  };

  // --- NEW: View Project Hierarchy ---
  const handleViewProject = async (project) => {
    try {
      setLoading(true);
      const data = await liveGroupDynamicAPI.getFullHierarchy(project.id);
      setProjectHierarchy(data.project); // Assuming API returns { project: ... } with nested towers/units
      setSelectedProject(project);
      setViewMode('detail');
    } catch (error) {
      console.error("Failed to load project details:", error);
      alert("Could not load project details.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedProject(null);
    setProjectHierarchy(null);
  };

  // --- NEW: Unit Action Handler ---
  const handleUnitClick = (unit) => {
    setSelectedUnit(unit);
    setShowUnitActionModal(true);
  };

  const handleEditClick = (unit) => {
    setEditingUnit(unit);
    setShowUnitEditModal(true);
  };

  const handleUnitUpdate = () => {
    // Refresh the whole project to ensure full hierarchy is in sync
    if (selectedProject) {
      handleViewProject(selectedProject);
    }
    toast.success('Unit updated successfully');
  };

  const handleAdminAction = async (action) => {
    if (!selectedUnit) return;
    setActionLoading(true);
    try {
      if (action === 'lock') {
        await liveGroupDynamicAPI.lockUnit(selectedUnit.id);
      } else if (action === 'book') {
        // Mock payment data for admin booking
        await liveGroupDynamicAPI.bookUnit(selectedUnit.id, {
          amount: 50000,
          currency: 'INR',
          userName: 'Admin Booking'
        });
      } else if (action === 'release') {
        // Release / Unbook Unit
        await liveGroupDynamicAPI.updateUnit(selectedUnit.id, {
          status: 'available',
          booked_by: null, // Clear booking data
          payment_id: null
        });
        toast.success('Unit released successfully');
      }

      // Refresh data
      const data = await liveGroupDynamicAPI.getFullHierarchy(selectedProject.id);
      setProjectHierarchy(data.project);
      setShowUnitActionModal(false);
    } catch (error) {
      console.error(`Failed to ${action} unit:`, error);
      alert(`Failed to ${action} unit: ` + error.message);
    } finally {
      setActionLoading(false);
    }
  };


  const addTowerRow = (type) => {
    const towers = typeTowers[type] || [];
    setTypeTowers({
      ...typeTowers,
      [type]: [...towers, { name: `${getLabel(type, 'parent')} ${String.fromCharCode(65 + towers.length)}`, floors: 10, unitsPerFloor: 4, layout_columns: '', layout_rows: '' }]
    });
  };

  const removeTowerRow = (type, index) => {
    const towers = typeTowers[type] || [];
    setTypeTowers({
      ...typeTowers,
      [type]: towers.filter((_, i) => i !== index)
    });
  };

  const updateTowerRow = (type, index, field, value) => {
    setTypeTowers(prev => {
      const towers = [...(prev[type] || [])];
      const updatedTower = { ...towers[index] };

      if (['floors', 'unitsPerFloor', 'total_bungalows', 'layout_columns', 'layout_rows'].includes(field)) {
        updatedTower[field] = value === '' ? '' : parseInt(value);
      } else {
        updatedTower[field] = value;
      }

      towers[index] = updatedTower;
      return { ...prev, [type]: towers };
    });

    // Initialize units for this type/tower if needed
    setTypeUnits(prev => {
      const typeConfig = prev[type] || {};
      if (!typeConfig[index]) {
        return { ...prev, [type]: { ...typeConfig, [index]: {} } };
      }
      return prev;
    });
  };

  const addUnitToConfig = (type, towerIdx, floorNum) => {
    setTypeUnits(prev => {
      const typeConfig = { ...(prev[type] || {}) };
      const towerConfig = { ...(typeConfig[towerIdx] || {}) };
      const floorUnits = [...(towerConfig[floorNum] || [])];

      const nextIdx = floorUnits.length;
      const label = type === 'commercial' ? `Shop ${nextIdx + 1}` : `Flat ${String.fromCharCode(65 + nextIdx)}`;

      floorUnits.push({
        unit_number: label,
        flat_label: label,
        unit_type: type === 'commercial' ? 'Commercial' : (type === 'apartment' ? 'Apartment' : (type === 'plot' ? 'Plot' : (type === 'twin_villa' ? 'Twin Villa' : 'Bungalow'))),
        area: globalUnitDefaults.sbua,
        carpet_area: globalUnitDefaults.carpetArea,
        price_per_sqft: globalUnitDefaults.baseRate,
        discount_price_per_sqft: globalUnitDefaults.discountRate,
        isCustom: false,
        price: globalUnitDefaults.sbua * (globalUnitDefaults.discountRate || globalUnitDefaults.baseRate)
      });

      towerConfig[floorNum] = floorUnits;
      typeConfig[towerIdx] = towerConfig;
      return { ...prev, [type]: typeConfig };
    });
  };

  const removeUnitFromConfig = (type, towerIdx, floorNum, unitIdx) => {
    setTypeUnits(prev => {
      const typeConfig = { ...(prev[type] || {}) };
      const towerConfig = { ...typeConfig[towerIdx] };
      const floorUnits = towerConfig[floorNum].filter((_, i) => i !== unitIdx);
      towerConfig[floorNum] = floorUnits;
      typeConfig[towerIdx] = towerConfig;
      return { ...prev, [type]: typeConfig };
    });
  };

  const updateUnitConfig = (type, towerIdx, floorNum, unitIdx, fieldOrObj, value) => {
    setTypeUnits(prev => {
      if (!prev[type] || !prev[type][towerIdx] || !prev[type][towerIdx][floorNum] || !prev[type][towerIdx][floorNum][unitIdx]) {
        return prev;
      }

      const nextState = structuredClone(prev);
      const unit = nextState[type][towerIdx][floorNum][unitIdx];

      if (typeof fieldOrObj === 'object') {
        Object.keys(fieldOrObj).forEach(key => {
          unit[key] = fieldOrObj[key];
        });
      } else {
        unit[fieldOrObj] = value;
      }

      if (unit.unit_type === 'plot') {
        const w = parseFloat(unit.plot_width) || 0;
        const d = parseFloat(unit.plot_depth) || 0;
        if (w > 0 && d > 0) {
          unit.area = w * d;
        }
      }

      if (!unit.isCustom) {
        unit.isCustom = true;
      }

      let calcArea = parseFloat(unit.area) || 0;
      if (type === 'bungalow' || type === 'villa' || type === 'twin_villa') {
        calcArea = parseFloat(unit.area) || parseFloat(unit.super_built_up_area) || 0;
      }

      const reg = parseFloat(unit.price_per_sqft) || 0;
      const disc = (unit.discount_price_per_sqft !== '' && unit.discount_price_per_sqft !== null && unit.discount_price_per_sqft !== undefined)
        ? parseFloat(unit.discount_price_per_sqft)
        : null;

      const effectiveRate = disc !== null ? disc : reg;
      unit.price = calcArea * effectiveRate;

      return nextState;
    });
  };

  const copyFloorConfig = (type, towerIdx, fromFloor, toFloor) => {
    setTypeUnits(prev => {
      const typeConfig = { ...(prev[type] || {}) };
      const towerConfig = { ...typeConfig[towerIdx] };
      towerConfig[toFloor] = (towerConfig[fromFloor] || []).map(u => ({ ...u }));
      typeConfig[towerIdx] = towerConfig;
      return { ...prev, [type]: typeConfig };
    });
  };

  const prepopulateTowerUnits = (type, towerIdx) => {
    const towers = typeTowers[type] || [];
    const tower = towers[towerIdx];
    if (!tower) return;

    const newConfig = {};
    const unitsPerFloor = parseInt(tower.unitsPerFloor) || 4;
    const floors = parseInt(tower.floors) || 0;

    const generateUnitsForFloor = () => {
      const units = [];
      for (let j = 0; j < unitsPerFloor; j++) {
        const label = `Flat ${String.fromCharCode(65 + j)}`;
        units.push({
          unit_number: label,
          flat_label: label,
          unit_type: type === 'apartment' ? 'Apartment' : (globalUnitDefaults.unitType || 'Apartment'),
          area: globalUnitDefaults.sbua,
          carpet_area: globalUnitDefaults.carpetArea,
          price_per_sqft: globalUnitDefaults.baseRate,
          discount_price_per_sqft: globalUnitDefaults.discountRate,
          isCustom: false,
          price: globalUnitDefaults.sbua * (globalUnitDefaults.discountRate || globalUnitDefaults.baseRate)
        });
      }
      return units;
    };

    if (type === 'bungalow' || type === 'twin_villa') {
      const totalBungalows = parseInt(tower.total_bungalows) || 1;
      const bungUnits = [];
      for (let k = 0; k < totalBungalows; k++) {
        bungUnits.push({
          unit_number: type === 'twin_villa' ? `TV-${k + 1}` : `B-${k + 1}`,
          unit_type: tower.bungalow_type || (type === 'twin_villa' ? 'Twin Villa' : 'Villa'),
          area: 2500,
          super_built_up_area: 2000,
          carpet_area: 1500,
          price: 0,
          discount_price: null,
          price_per_sqft: 0,
          discount_price_per_sqft: null
        });
      }
      newConfig[0] = bungUnits;
    } else if (type === 'plot') {
      const rows = parseInt(tower.layout_rows) || 5;
      const cols = parseInt(tower.layout_columns) || 4;
      const plotUnits = [];
      const totalPlots = rows * cols;
      const config = projectData.property_configs[type] || {};

      for (let k = 0; k < totalPlots; k++) {
        plotUnits.push({
          unit_number: `P-${k + 1}`,
          unit_type: 'Plot',
          area: projectData.area || 1200,
          plot_width: config.plot_size_width || 30,
          plot_depth: config.plot_size_depth || 40,
          price: 0,
          discount_price: null,
          price_per_sqft: projectData.regular_price_per_sqft || 0,
          discount_price_per_sqft: projectData.group_price_per_sqft || null,
          isCustom: false
        });
      }
      newConfig[0] = plotUnits;
    } else {
      if (tower.hasBasement) newConfig[-1] = generateUnitsForFloor();
      if (tower.hasGroundFloor) newConfig[0] = generateUnitsForFloor();
      for (let f = 1; f <= floors; f++) {
        newConfig[f] = generateUnitsForFloor();
      }
    }

    setTypeUnits(prev => {
      const next = { ...prev };
      next[type] = { ...(next[type] || {}), [towerIdx]: newConfig };
      return next;
    });
  };

  const getLabel = (type, context) => {
    switch (type) {
      case 'apartment':
        return context === 'parent' ? 'Tower' : 'Unit';
      case 'bungalow':
      case 'twin_villa':
        return context === 'parent' ? 'Block' : (type === 'twin_villa' ? 'Twin Villa' : 'Bungalow');
      case 'plot':
        return context === 'parent' ? 'Sector' : 'Plot';
      case 'mixed_use':
        return context === 'parent' ? 'Building' : 'Unit / Shop / Flat';
      case 'commercial':
        return context === 'parent' ? 'Block' : 'Unit';
      default:
        return context === 'parent' ? 'Group' : 'Item';
    }
  };

  return (
    <div className="admin-live-grouping overhaul">
      {/* LOADING OVERLAY */}
      <AnimatePresence>
        {saving && (
          <motion.div
            className="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="loader-content">
              <div className="spinner large"></div>
              <h3>Generating Project...</h3>
              <p>Creating towers, units, and 3D data.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="admin-header-v2">
        <div className="header-content">
          <h1>Live Grouping <span className="badge">Data Driven</span></h1>
          <p>Create and manage projects with dynamic tower and unit hierarchies.</p>
        </div>
        {viewMode === 'list' && (
          <button className="primary-btn" onClick={() => setShowWizard(true)}>
            <Plus size={20} /> New Project Wizard
          </button>
        )}
      </div>

      {loading ? (
        <div className="admin-loader">
          <div className="spinner"></div>
          <p>Loading projects...</p>
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            // LIST VIEW
            <div className="projects-grid-v2">
              {projects.map(project => (
                <motion.div
                  className="project-card-v2"
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="card-image">
                    <img src={project.image || '/placeholder-property.jpg'} alt={project.title} />
                    <div className={`status-pill ${project.status}`}>{project.status}</div>
                  </div>
                  <div className="card-body">
                    <h3>{project.title}</h3>
                    <p className="location"><Building2 size={14} /> {project.location}</p>
                    <div className="stat">
                      <span className="label">Type</span>
                      <span className="value font-medium text-blue-600">{project.type}</span>
                    </div>
                    <div className="stat">
                      <span className="label">{getLabel(project.type, 'parent')}s</span>
                      <span className="value">{project.tower_count || 'N/A'}</span>
                    </div>
                    <div className="stat">
                      <span className="label">{getLabel(project.type, 'child')}s</span>
                      <span className="value">{project.total_slots}</span>
                    </div>
                    <div className="actions">
                      <button className="icon-btn primary" title="Manage Units" onClick={() => handleViewProject(project)}>
                        <LayoutGrid size={20} />
                      </button>
                      <select
                        className="status-dropdown"
                        value={project.status}
                        onChange={(e) => handleStatusChange(project.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="live">Live</option>
                        <option value="closed">Closed</option>
                      </select>
                      <button className="icon-btn delete" title="Delete Project" onClick={() => handleDeleteProject(project.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // DETAIL/2D VIEW
            <div className="detail-view-container relative h-[calc(100vh-140px)] w-full flex flex-col">
              <div className="flex items-center gap-4 mb-4 px-4">
                <button onClick={handleBackToList} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                  <ArrowLeft size={18} /> Back to Projects
                </button>
                <h2 className="text-xl font-bold text-slate-800">{selectedProject?.title} - Unit Management</h2>
              </div>

              {/* 2D View Container - Dark Mode Wrapper */}
              <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700 relative">
                {projectHierarchy ? (
                  <TwoDView
                    project={projectHierarchy}
                    onUnitClick={handleUnitClick}
                    onEditClick={handleEditClick}
                    isAdminView={true}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">Loading hierarchy...</div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* MULTI-STEP WIZARD MODAL */}
      <AnimatePresence>
        {showWizard && (
          <motion.div
            className="wizard-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="wizard-modal"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <div className="wizard-header">
                <h2>Create Live Grouping Project</h2>
                <button className="close-btn" onClick={() => setShowWizard(false)}><X /></button>
              </div>

              <div className="wizard-stepper">
                {getWizardSteps().map((s, idx) => (
                  <Fragment key={s.id}>
                    <div className={`step ${wizardStep >= s.id ? 'active' : ''} ${wizardStep > s.id ? 'completed' : ''}`}>
                      <div className="node">{s.id}</div>
                      <span>{s.label}</span>
                    </div>
                    {idx < getWizardSteps().length - 1 && <div className="line"></div>}
                  </Fragment>
                ))}
              </div>

              <div className="wizard-content">
                {wizardStep === 1 && (
                  <div className="step-pane">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-slate-800">Select Property Type</h3>
                      <p className="text-slate-500">Choose the type of property for this project to customize the creation flow.</p>
                    </div>
                    <div className="property-type-grid">
                      {PROPERTY_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                          <div
                            key={type.id}
                            className={`type-card ${projectData.type === type.id ? 'active' : ''}`}
                            onClick={() => {
                              const newType = type.id;
                              setProjectData(prev => {
                                const nextTypes = newType === 'mixed_use' ? [] : [newType];
                                return { ...prev, type: newType, property_types: nextTypes };
                              });

                              if (newType !== 'mixed_use') {
                                // Clear old states and init new
                                setTypeTowers({});
                                setTypeUnits({});
                                initPropertyTypeState(newType);
                              }
                            }}
                          >
                            <div className="type-icon">
                              <Icon size={32} />
                            </div>
                            <div className="type-info">
                              <h4>{type.label}</h4>
                              <p>{type.desc}</p>
                            </div>
                            <div className="selection-indicator">
                              <CheckCircle2 size={20} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}


                {wizardStep === 2 && (
                  <div className="step-pane">
                    <h3>Project Information</h3>
                    <div className="form-grid">
                      <div className="input-group">
                        <label>Project Title / Business Name <span style={{ color: 'red' }}>*</span></label>
                        <input
                          type="text"
                          value={projectData.title || ''}
                          onChange={e => setProjectData({ ...projectData, title: e.target.value })}
                          placeholder="e.g. Skyline Residency"
                          maxLength={100}
                        />
                        {projectData.title && projectData.title.length > 90 && (
                          <p className="text-[10px] text-orange-500 mt-1">{100 - projectData.title.length} characters remaining</p>
                        )}
                      </div>
                      <div className="input-group">
                        <label>Min Buyers <span style={{ color: 'red' }}>*</span></label>
                        <input
                          type="number"
                          value={projectData.min_buyers || ''}
                          onChange={e => setProjectData({ ...projectData, min_buyers: e.target.value })}
                          placeholder="e.g. 10"
                        />
                      </div>
                      <div className="input-group">
                        <label>Location / Address <span style={{ color: 'red' }}>*</span></label>
                        <input type="text" value={projectData.location || ''} onChange={e => setProjectData({ ...projectData, location: e.target.value })} placeholder="e.g. Sector 45, Gurgaon" />
                      </div>

                      {projectData.type === 'commercial' && (
                        <>
                          <div className="input-group">
                            <label>Total Land Area (SqFt) <span style={{ color: 'red' }}>*</span></label>
                            <input
                              type="number"
                              value={projectData.area || ''}
                              onChange={e => setProjectData({ ...projectData, area: e.target.value })}
                              placeholder="e.g. 5000"
                            />
                          </div>
                          <div className="input-group">
                            <label>Front Road Width (Ft) <span style={{ color: 'red' }}>*</span></label>
                            <input
                              type="number"
                              value={projectData.road_width || ''}
                              onChange={e => setProjectData({ ...projectData, road_width: e.target.value })}
                              placeholder="e.g. 60"
                            />
                          </div>
                          <div className="input-group">
                            <label>Orientation</label>
                            <select
                              value={projectData.orientation || ''}
                              onChange={e => setProjectData({ ...projectData, orientation: e.target.value })}
                              className="w-full p-2 border rounded"
                            >
                              <option value="">Select Orientation</option>
                              <option value="North">North Facing</option>
                              <option value="South">South Facing</option>
                              <option value="East">East Facing</option>
                              <option value="West">West Facing</option>
                              <option value="NE">North-East</option>
                              <option value="NW">North-West</option>
                              <option value="SE">South-East</option>
                              <option value="SW">South-West</option>
                            </select>
                          </div>
                          <div className="input-group">
                            {/* Placeholder to maintain grid if needed, or just leave it */}
                          </div>
                        </>
                      )}

                      {/* Location Picker Integration */}
                      <div className="input-group full">
                        <label>Pin Precise Location</label>
                        <div style={{ height: '450px', width: '100%', marginBottom: '1rem' }}>
                          <LocationPicker
                            onLocationSelect={handleLocationSelect}
                            initialLat={projectData.latitude}
                            initialLng={projectData.longitude}
                            initialAddress={projectData.map_address}
                          />
                        </div>
                      </div>
                      <div className="input-group full">
                        <label>Images</label>
                        <input type="file" multiple onChange={handleImageChange} accept="image/*" />
                        <div className="previews">
                          {imagePreviews.map((p, i) => <img key={i} src={p} alt="" />)}
                        </div>
                      </div>
                      <div className="input-group full">
                        <label>Brochure (PDF)</label>
                        <input type="file" onChange={handleBrochureChange} accept=".pdf" />
                        {brochurePreview && <p className="text-sm text-green-600 mt-1">✓ {brochurePreview}</p>}
                      </div>
                      {/* --- EXTENDED OPTIONAL FIELDS --- */}
                      <div className="form-divider col-span-2 my-4 border-t pt-4 font-bold text-slate-800">Extended Information (Optional)</div>



                      <div className="input-group">
                        <label>Builder Name</label>
                        <input type="text" value={projectData.builder_name || ''} onChange={e => setProjectData({ ...projectData, builder_name: e.target.value })} placeholder="Company Name" />
                      </div>
                      <div className="input-group">
                        <label>Property Type (Detail)</label>
                        <input type="text" value={projectData.property_type || ''} onChange={e => setProjectData({ ...projectData, property_type: e.target.value })} placeholder="e.g. Luxury Apartment" />
                      </div>
                      <div className="input-group">
                        <label>Types of Units:</label>
                        <input type="text" value={projectData.unit_configuration || ''} onChange={e => setProjectData({ ...projectData, unit_configuration: e.target.value })} placeholder="e.g. 3BHK, 2BHK, 1BHK" />
                      </div>



                      <div className="input-group">
                        <label>Discount %</label>
                        <input type="number" value={projectData.discount_percentage || ''} onChange={e => setProjectData({ ...projectData, discount_percentage: e.target.value })} placeholder="e.g. 15" />
                      </div>
                      <div className="input-group">
                        <label>Discount Label</label>
                        <input type="text" value={projectData.discount_label || ''} onChange={e => setProjectData({ ...projectData, discount_label: e.target.value })} placeholder="e.g. Grouping offer" />
                      </div>
                      <div className="input-group">
                        <label>Offer Expiry</label>
                        <input type="datetime-local" value={projectData.offer_expiry_datetime || ''} onChange={e => setProjectData({ ...projectData, offer_expiry_datetime: e.target.value })} />
                      </div>

                      <div className="input-group">
                        <label>Regular Price/SqFt</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input
                            type="number"
                            placeholder="Min"
                            value={projectData.regular_price_per_sqft || ''}
                            onChange={e => setProjectData({ ...projectData, regular_price_per_sqft: e.target.value })}
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={projectData.regular_price_per_sqft_max || ''}
                            onChange={e => setProjectData({ ...projectData, regular_price_per_sqft_max: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="input-group">
                        <label>Group Price/SqFt</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input
                            type="number"
                            placeholder="Min"
                            value={projectData.group_price_per_sqft || ''}
                            onChange={e => setProjectData({ ...projectData, group_price_per_sqft: e.target.value })}
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={projectData.group_price_per_sqft_max || ''}
                            onChange={e => setProjectData({ ...projectData, group_price_per_sqft_max: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="input-group">
                        <label>Regular Price (Min - Max)</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input
                            type="number"
                            placeholder="Min"
                            value={projectData.regular_price_min || ''}
                            onChange={e => setProjectData({ ...projectData, regular_price_min: e.target.value })}
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={projectData.regular_price_max || ''}
                            onChange={e => setProjectData({ ...projectData, regular_price_max: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="input-group">
                        <label>Discounted Total (Min - Max)</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input
                            type="number"
                            placeholder="Min"
                            value={projectData.discounted_total_price_min || ''}
                            onChange={e => setProjectData({ ...projectData, discounted_total_price_min: e.target.value })}
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={projectData.discounted_total_price_max || ''}
                            onChange={e => setProjectData({ ...projectData, discounted_total_price_max: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="input-group">
                        <label>Savings (Min - Max)</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input
                            type="number"
                            placeholder="Min"
                            value={projectData.total_savings_min || ''}
                            onChange={e => setProjectData({ ...projectData, total_savings_min: e.target.value })}
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={projectData.total_savings_max || ''}
                            onChange={e => setProjectData({ ...projectData, total_savings_max: e.target.value })}
                          />
                        </div>
                      </div>







                    </div>
                  </div>
                )}

                {wizardStep === 5 && (
                  <div className="step-pane">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-slate-800">Project Creation Summary</h3>
                      <p className="text-slate-500">Review all project components before creation.</p>
                    </div>

                    <div className="summary-grid bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-6 pb-4 border-b">
                        <h4 className="font-bold text-slate-800">General Information</h4>
                        <span className="badge bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-1 rounded-md uppercase">Ready to Create</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Project Name</p>
                          <p className="font-bold text-slate-700">{projectData.title}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Location</p>
                          <p className="font-bold text-slate-700 truncate">{projectData.location}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Buyers Goal</p>
                          <p className="font-bold text-slate-700">{projectData.min_buyers} Required</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-6 pb-4 border-b">
                        <h4 className="font-bold text-slate-800">Component Breakdown</h4>
                      </div>
                      <div className="space-y-4">
                        {projectData.property_types.map(typeId => {
                          const typeInfo = PROPERTY_TYPES.find(t => t.id === typeId);
                          const Icon = typeInfo?.icon || LayoutGrid;
                          const config = projectData.property_configs[typeId] || {};
                          const PTOWERS = typeTowers[typeId] || [];
                          const PUNITS = typeUnits[typeId] || {};

                          return (
                            <div key={typeId} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                                  <Icon size={20} />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-700">{typeInfo?.label}</p>
                                  <p className="text-[10px] text-slate-400 uppercase tracking-tighter font-semibold">{typeId}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                {typeId === 'commercial' ? (
                                  <div>
                                    <p className="font-bold text-slate-700">{config.total_units || 0} units</p>
                                    <p className="text-[9px] text-slate-400 uppercase">Commercial Units</p>
                                  </div>
                                ) : (
                                  <div>
                                    <p className="font-bold text-slate-700">
                                      {PTOWERS.length} {getLabel(typeId, 'parent')}s
                                    </p>
                                    <p className="text-[9px] text-slate-400 uppercase whitespace-nowrap">
                                      {Object.values(PUNITS).reduce((acc, tow) => acc + Object.values(tow).flat().length, 0)} Total Units
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-8 pt-6 border-t flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Project Total</p>
                          <p className="text-2xl font-black text-blue-600">
                            {projectData.property_types.reduce((acc, typeId) => {
                              if (typeId === 'commercial') return acc + parseInt(projectData.property_configs.commercial?.total_units || 0);
                              const PUNITS = typeUnits[typeId] || {};
                              return acc + Object.values(PUNITS).reduce((sum, tow) => sum + Object.values(tow).flat().length, 0);
                            }, 0)} Total Slots
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Assets Tracking</p>
                          <div className="flex gap-2">
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded uppercase">{imageFiles.length} Gallery</span>
                            {brochureFile && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase">Brochure</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 3 && projectData.type !== 'commercial' && (
                  <div className="step-pane">
                    {projectData.type === 'mixed_use' && (
                      <div className="mixed-use-type-selector mb-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                        <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <LayoutGrid className="text-blue-600" size={20} />
                          Select Project Components
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {PROPERTY_TYPES.filter(t => t.id !== 'mixed_use').map(type => (
                            <label key={type.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${projectData.property_types.includes(type.id) ? 'bg-white border-blue-500 shadow-md' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                              <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                checked={projectData.property_types.includes(type.id)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const typeId = type.id;
                                  setProjectData(prev => {
                                    const nextTypes = checked
                                      ? [...prev.property_types, typeId]
                                      : prev.property_types.filter(t => t !== typeId);
                                    return { ...prev, property_types: nextTypes };
                                  });

                                  if (checked) {
                                    initPropertyTypeState(typeId);
                                  } else {
                                    deletePropertyTypeState(typeId);
                                  }
                                }}
                              />
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-700 text-sm">{type.label}</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider">{type.id}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                        {projectData.property_types.length === 0 && (
                          <p className="text-red-500 text-xs mt-3 flex items-center gap-1 italic">
                            <AlertCircle size={12} /> Please select at least one property type to continue.
                          </p>
                        )}
                      </div>
                    )}

                    {/* DYNAMIC CONFIGURATION SECTIONS */}
                    <div className="space-y-8">
                      {projectData.property_types.map(type => {
                        const isCommercial = type === 'commercial';
                        const towers = typeTowers[type] || [];
                        const config = projectData.property_configs[type] || {};

                        if (isCommercial) {
                          return (
                            <div key={type} className="config-section p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Store className="text-orange-500" size={20} />
                                Commercial Configuration
                              </h3>
                              <div className="form-grid">
                                <div className="input-group">
                                  <label>Units per Row (Columns) <span className="text-red-500">*</span></label>
                                  <input
                                    type="number"
                                    value={config.layout_columns || ''}
                                    onChange={e => setProjectData(prev => ({
                                      ...prev,
                                      property_configs: {
                                        ...prev.property_configs,
                                        [type]: { ...config, layout_columns: e.target.value }
                                      }
                                    }))}
                                    placeholder="e.g. 5"
                                  />
                                </div>
                                <div className="input-group">
                                  <label>Total Units</label>
                                  <input
                                    type="number"
                                    value={config.total_units || ''}
                                    onChange={e => setProjectData(prev => ({
                                      ...prev,
                                      property_configs: {
                                        ...prev.property_configs,
                                        [type]: { ...config, total_units: e.target.value }
                                      }
                                    }))}
                                    placeholder="e.g. 10"
                                  />
                                </div>
                                <div className="input-group">
                                  <label>Frontage per Unit (Ft) <span className="text-red-500">*</span></label>
                                  <input
                                    type="number"
                                    value={config.plot_size_width || ''}
                                    onChange={e => setProjectData(prev => ({
                                      ...prev,
                                      property_configs: {
                                        ...prev.property_configs,
                                        [type]: { ...config, plot_size_width: e.target.value }
                                      }
                                    }))}
                                    placeholder="Min 5, Max 50"
                                  />
                                </div>
                                <div className="input-group">
                                  <label>Depth per Unit (Ft) <span className="text-red-500">*</span></label>
                                  <input
                                    type="number"
                                    value={config.plot_size_depth || ''}
                                    onChange={e => setProjectData(prev => ({
                                      ...prev,
                                      property_configs: {
                                        ...prev.property_configs,
                                        [type]: { ...config, plot_size_depth: e.target.value }
                                      }
                                    }))}
                                    placeholder="Min 5, Max 50"
                                  />
                                </div>
                                <div className="input-group">
                                  <label>Floor Count per Unit <span className="text-red-500">*</span></label>
                                  <select
                                    value={config.commercial_floor_count || 1}
                                    onChange={e => setProjectData(prev => ({
                                      ...prev,
                                      property_configs: {
                                        ...prev.property_configs,
                                        [type]: { ...config, commercial_floor_count: e.target.value }
                                      }
                                    }))}
                                    className="w-full p-2 border rounded"
                                  >
                                    <option value={1}>G + 0 (Ground only)</option>
                                    <option value={2}>G + 1</option>
                                    <option value={3}>G + 2</option>
                                    <option value={4}>G + 3 (Max)</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // Standard Hierarchy UI
                        return (
                          <div key={type} className="config-section p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                            <div className="pane-header mb-6">
                              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                {PROPERTY_TYPES.find(pt => pt.id === type)?.icon && React.createElement(PROPERTY_TYPES.find(pt => pt.id === type).icon, { className: "text-blue-600", size: 20 })}
                                {getLabel(type, 'parent')} Configuration ({type})
                              </h3>
                              <button className="add-btn" onClick={() => addTowerRow(type)}>
                                <Plus size={16} /> Add {getLabel(type, 'parent')}
                              </button>
                            </div>

                            <table className="wizard-table">
                              <thead>
                                <tr>
                                  <th>{getLabel(type, 'parent')} Name</th>
                                  {type === 'bungalow' || type === 'twin_villa' || type === 'plot' ? (
                                    <>
                                      <th>{type === 'plot' ? 'Total Plots' : 'Total Units'}</th>
                                      <th>{type === 'plot' ? '3D Layout' : 'Type'}</th>
                                    </>
                                  ) : (
                                    <>
                                      <th>Floors</th>
                                      <th>Units per Floor</th>
                                      <th>Extra Levels</th>
                                      <th>3D Layout Cols</th>
                                    </>
                                  )}
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(typeTowers[type] || []).map((t, idx) => (
                                  <tr key={idx}>
                                    <td><input type="text" value={t.name || ''} onChange={e => updateTowerRow(type, idx, 'name', e.target.value)} /></td>

                                    {(type === 'bungalow' || type === 'twin_villa' || type === 'plot') ? (
                                      <>
                                        <td>
                                          <input
                                            type="number"
                                            value={type === 'plot' ? (t.layout_rows * t.layout_columns || '') : (t.total_bungalows || '')}
                                            onChange={e => updateTowerRow(type, idx, type === 'plot' ? 'total_plots' : 'total_bungalows', e.target.value)}
                                            placeholder={type === 'plot' ? "Auto" : "e.g. 10"}
                                            readOnly={type === 'plot'}
                                          />
                                        </td>
                                        <td>
                                          {type === 'plot' ? (
                                            <div className="flex gap-1 items-center">
                                              <input type="number" placeholder="R" className="w-12 text-xs" value={t.layout_rows || ''} onChange={e => updateTowerRow(type, idx, 'layout_rows', e.target.value)} />
                                              <span className="text-[10px]">x</span>
                                              <input type="number" placeholder="C" className="w-12 text-xs" value={t.layout_columns || ''} onChange={e => updateTowerRow(type, idx, 'layout_columns', e.target.value)} />
                                            </div>
                                          ) : (
                                            <select
                                              value={t.bungalow_type || (type === 'twin_villa' ? 'Twin Villa' : 'Villa')}
                                              onChange={e => updateTowerRow(type, idx, 'bungalow_type', e.target.value)}
                                              className="w-full p-2 border rounded"
                                            >
                                              <option value="Villa">Villa</option>
                                              <option value="Bungalow">Bungalow</option>
                                              <option value="Row House">Row House</option>
                                              <option value="twin_villa">Twin Villa</option>
                                              <option value="plot">Plot</option>
                                            </select>
                                          )}
                                        </td>
                                      </>
                                    ) : (
                                      <>
                                        <td><input type="number" value={t.floors || ''} onChange={e => updateTowerRow(type, idx, 'floors', e.target.value)} placeholder="" /></td>
                                        <td>
                                          <input
                                            type="number"
                                            value={t.unitsPerFloor || ''}
                                            onChange={e => updateTowerRow(type, idx, 'unitsPerFloor', e.target.value)}
                                            placeholder="e.g. 4"
                                          />
                                        </td>
                                        <td>
                                          <div className="flex flex-col gap-1">
                                            <label className="text-xs flex items-center gap-1 cursor-pointer">
                                              <input type="checkbox" checked={t.hasGroundFloor || false} onChange={e => updateTowerRow(type, idx, 'hasGroundFloor', e.target.checked)} /> GF
                                            </label>
                                            <label className="text-xs flex items-center gap-1 cursor-pointer">
                                              <input type="checkbox" checked={t.hasBasement || false} onChange={e => updateTowerRow(type, idx, 'hasBasement', e.target.checked)} /> Basement
                                            </label>
                                          </div>
                                        </td>
                                        <td>
                                          <input
                                            type="number"
                                            value={t.layout_columns || ''}
                                            onChange={e => updateTowerRow(type, idx, 'layout_columns', e.target.value)}
                                            placeholder="Auto"
                                            style={{ width: '60px' }}
                                          />
                                        </td>
                                      </>
                                    )}
                                    <td><button className="remove-btn" onClick={() => removeTowerRow(type, idx)}><Trash2 size={16} /></button></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            {(type === 'bungalow' || type === 'twin_villa' || type === 'plot') && (
                              <div className="form-grid mt-6">
                                <div className="form-divider col-span-2 my-4 border-t pt-4 font-bold text-slate-800">
                                  {type === 'plot' ? 'Land Layout Configuration' : '3D Layout Configuration (Optional)'}
                                </div>
                                <div className="input-group">
                                  <label>Row/Positioning</label>
                                  <div className="flex gap-2">
                                    <input
                                      type="number"
                                      placeholder="Row Index"
                                      value={config.layout_rows || ''}
                                      onChange={e => setProjectData(prev => ({
                                        ...prev,
                                        property_configs: {
                                          ...prev.property_configs,
                                          [type]: { ...config, layout_rows: e.target.value }
                                        }
                                      }))}
                                    />
                                    <input
                                      type="number"
                                      placeholder="Cols"
                                      value={config.layout_columns || ''}
                                      onChange={e => setProjectData(prev => ({
                                        ...prev,
                                        property_configs: {
                                          ...prev.property_configs,
                                          [type]: { ...config, layout_columns: e.target.value }
                                        }
                                      }))}
                                    />
                                  </div>
                                </div>
                                <div className="input-group">
                                  <label>Road Width / Gap</label>
                                  <div className="flex gap-2">
                                    <input
                                      type="number"
                                      placeholder="Road"
                                      value={config.road_width || ''}
                                      onChange={e => setProjectData(prev => ({
                                        ...prev,
                                        property_configs: {
                                          ...prev.property_configs,
                                          [type]: { ...config, road_width: e.target.value }
                                        }
                                      }))}
                                    />
                                    <input
                                      type="number"
                                      placeholder="Gap"
                                      value={config.plot_gap || ''}
                                      onChange={e => setProjectData(prev => ({
                                        ...prev,
                                        property_configs: {
                                          ...prev.property_configs,
                                          [type]: { ...config, plot_gap: e.target.value }
                                        }
                                      }))}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {wizardStep === 4 && (
                  <div className="step-pane">
                    <div className="pane-header">
                      <h3>Building Units Configurator</h3>
                      <div className="flex gap-2">
                        <span className="badge bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          Mixed Use Ready
                        </span>
                      </div>
                    </div>

                    <div className="unit-configurator-container">
                      {/* GLOBAL DEFAULTS SECTION */}
                      {projectData.property_types.some(type => !['bungalow', 'twin_villa', 'plot', 'commercial'].includes(type)) && (
                        <div className="global-defaults-wrapper mb-8">
                          <div className={`global-defaults-panel bg-white border border-blue-100 rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${isGlobalDefaultsCollapsed ? 'max-h-14' : 'max-h-96'}`}>
                            <div
                              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                              onClick={() => setIsGlobalDefaultsCollapsed(!isGlobalDefaultsCollapsed)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                  <Tower size={20} />
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-800 text-sm">Default Unit Configuration (Global)</h4>
                                  {!isGlobalDefaultsCollapsed && <p className="text-[10px] text-slate-500 uppercase font-semibold">Applied to all default units</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isGlobalDefaultsCollapsed && (
                                  <div className="hidden md:flex gap-3 mr-4">
                                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">{globalUnitDefaults.unitType}</span>
                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold">{globalUnitDefaults.sbua} SqFt</span>
                                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded font-bold">₹{globalUnitDefaults.baseRate}</span>
                                  </div>
                                )}
                                <button className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                                  {isGlobalDefaultsCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                                </button>
                              </div>
                            </div>

                            {!isGlobalDefaultsCollapsed && (
                              <div className="p-6 pt-2 bg-gradient-to-r from-white to-blue-50/30">
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                  <div className="input-field-group">
                                    <label>Default Type</label>
                                    <select
                                      className="text-xs border rounded p-2 w-full"
                                      value={globalUnitDefaults.unitType}
                                      onChange={e => setGlobalUnitDefaults({ ...globalUnitDefaults, unitType: e.target.value })}
                                    >
                                      <option value="Flat">Flat</option>
                                      <option value="Shop">Shop</option>
                                      <option value="Office">Office</option>
                                      <option value="Showroom">Showroom</option>
                                    </select>
                                  </div>
                                  <div className="input-field-group">
                                    <label>SBUA (SQFT)</label>
                                    <input
                                      type="number"
                                      className="text-xs border rounded p-2 w-full"
                                      value={globalUnitDefaults.sbua}
                                      onChange={e => setGlobalUnitDefaults({ ...globalUnitDefaults, sbua: parseFloat(e.target.value) || 0 })}
                                    />
                                  </div>
                                  <div className="input-field-group">
                                    <label>Carpet (SQFT)</label>
                                    <input
                                      type="number"
                                      className="text-xs border rounded p-2 w-full"
                                      value={globalUnitDefaults.carpetArea}
                                      onChange={e => setGlobalUnitDefaults({ ...globalUnitDefaults, carpetArea: parseFloat(e.target.value) || 0 })}
                                    />
                                  </div>
                                  <div className="input-field-group">
                                    <label>Base Rate (₹)</label>
                                    <input
                                      type="number"
                                      className="text-xs border rounded p-2 w-full"
                                      value={globalUnitDefaults.baseRate}
                                      onChange={e => setGlobalUnitDefaults({ ...globalUnitDefaults, baseRate: parseFloat(e.target.value) || 0 })}
                                    />
                                  </div>
                                  <div className="input-field-group">
                                    <label>Discount Rate (₹)</label>
                                    <input
                                      type="number"
                                      className="text-xs border rounded p-2 w-full"
                                      value={globalUnitDefaults.discountRate}
                                      onChange={e => setGlobalUnitDefaults({ ...globalUnitDefaults, discountRate: parseFloat(e.target.value) || 0 })}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {projectData.property_types.map(type => {
                        const config = projectData.property_configs[type] || {};
                        const towers = typeTowers[type] || [];
                        const isHierarchyType = !['commercial'].includes(type);

                        if (type === 'commercial') {
                          return (
                            <div key={type} className="property-type-block mb-10 border-l-4 border-orange-500 pl-4">
                              <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Store className="text-orange-500" size={20} />
                                Commercial Extras (Parking & Access)
                              </h4>
                              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="input-group">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Parking Type</label>
                                    <select
                                      value={config.parking_type || 'Front'}
                                      onChange={e => setProjectData(prev => ({
                                        ...prev,
                                        property_configs: {
                                          ...prev.property_configs,
                                          [type]: { ...config, parking_type: e.target.value }
                                        }
                                      }))}
                                      className="w-full p-2 border rounded-lg"
                                    >
                                      <option value="Front">Front Parking</option>
                                      <option value="Back">Back Parking</option>
                                      <option value="Basement">Basement Parking</option>
                                      <option value="None">No Dedicated Parking</option>
                                    </select>
                                  </div>
                                  <div className="input-group">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Total Parking Slots</label>
                                    <input
                                      type="number"
                                      value={config.parking_slots || ''}
                                      onChange={e => setProjectData(prev => ({
                                        ...prev,
                                        property_configs: {
                                          ...prev.property_configs,
                                          [type]: { ...config, parking_slots: e.target.value }
                                        }
                                      }))}
                                      placeholder="e.g. 50"
                                      className="w-full p-2 border rounded-lg"
                                    />
                                  </div>
                                  <div className="input-group md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Entry Points & Accessibility</label>
                                    <textarea
                                      value={config.entry_points || ''}
                                      onChange={e => setProjectData(prev => ({
                                        ...prev,
                                        property_configs: {
                                          ...prev.property_configs,
                                          [type]: { ...config, entry_points: e.target.value }
                                        }
                                      }))}
                                      placeholder="e.g. Main entry from 60ft road, service entry from back lane."
                                      rows={3}
                                      className="w-full p-2 border rounded-lg"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={type} className="property-type-block mb-10 border-l-4 border-blue-500 pl-4">
                            <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                              {PROPERTY_TYPES.find(pt => pt.id === type)?.label} Components
                            </h4>

                            {towers.map((tower, towerIdx) => {
                              const isTowerCollapsed = collapsedTowers.includes(`${type}-${towerIdx}`);
                              return (
                                <div key={towerIdx} className="tower-config-block border rounded-xl overflow-hidden mb-6 bg-slate-50">
                                  <div className="tower-name-bar bg-slate-200 px-4 py-2 font-bold flex justify-between items-center text-slate-700">
                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={() => toggleTowerCollapse(`${type}-${towerIdx}`)}
                                        className="p-1 hover:bg-slate-300 rounded-md transition-colors"
                                      >
                                        {isTowerCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                                      </button>
                                      <div>
                                        {(type === 'bungalow' || type === 'twin_villa' || type === 'plot') ? (
                                          <>
                                            {tower.name} ({(type === 'plot' ? tower.layout_rows * tower.layout_columns : tower.total_bungalows) || 0} {type === 'plot' ? 'Plots' : 'Units'})
                                            <span className="ml-3 text-xs font-normal">Total Units: {Object.values((typeUnits[type] || {})[towerIdx] || {}).flat().length}</span>
                                          </>
                                        ) : (
                                          <>
                                            {tower.name} ({tower.floors} Floors)
                                            <span className="ml-3 text-xs font-normal">Total Units: {Object.values((typeUnits[type] || {})[towerIdx] || {}).flat().length}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => prepopulateTowerUnits(type, towerIdx)}
                                      className="text-[10px] bg-white text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                                    >
                                      {(type === 'bungalow' || type === 'twin_villa' || type === 'plot') ? `Reset ${type === 'plot' ? 'Plots' : 'Bungalows'}` : 'Reset to Defaults'}
                                    </button>
                                  </div>

                                  {!isTowerCollapsed && (
                                    <>
                                      {(type === 'bungalow' || type === 'twin_villa' || type === 'plot') ? (
                                        <div className="p-4">
                                          <BungalowGrid
                                            units={((typeUnits[type] || {})[towerIdx]?.[0] || [])}
                                            onUpdate={(uIdx, field, val) => updateUnitConfig(type, towerIdx, 0, uIdx, field, val)}
                                            onRemove={(uIdx) => removeUnitFromConfig(type, towerIdx, 0, uIdx)}
                                            onAdd={() => addUnitToConfig(type, towerIdx, 0)}
                                            globalDefaults={globalUnitDefaults}
                                            projectType={type}
                                          />
                                        </div>
                                      ) : (
                                        <div className="tower-floors-list p-4 space-y-4">
                                          {/* Special Floors */}
                                          {tower.hasBasement && (
                                            <FloorRow
                                              towerIdx={`${type}-${towerIdx}`}
                                              floorNum={-1}
                                              floorName="Basement"
                                              units={(typeUnits[type] || {})[towerIdx]?.[-1] || []}
                                              onAdd={() => addUnitToConfig(type, towerIdx, -1)}
                                              onRemove={(uIdx) => removeUnitFromConfig(type, towerIdx, -1, uIdx)}
                                              onUpdate={(uIdx, f, v) => updateUnitConfig(type, towerIdx, -1, uIdx, f, v)}
                                              projectType={type}
                                              globalDefaults={globalUnitDefaults}
                                              generateFlatLabels={generateFlatLabels}
                                              isCollapsed={collapsedFloors[`${type}-${towerIdx}--1`]}
                                              onToggle={() => toggleFloorCollapse(`${type}-${towerIdx}`, -1)}
                                            />
                                          )}
                                          {tower.hasGroundFloor && (
                                            <FloorRow
                                              towerIdx={`${type}-${towerIdx}`}
                                              floorNum={0}
                                              floorName="Ground Floor"
                                              units={(typeUnits[type] || {})[towerIdx]?.[0] || []}
                                              onAdd={() => addUnitToConfig(type, towerIdx, 0)}
                                              onRemove={(uIdx) => removeUnitFromConfig(type, towerIdx, 0, uIdx)}
                                              onUpdate={(uIdx, f, v) => updateUnitConfig(type, towerIdx, 0, uIdx, f, v)}
                                              projectType={type}
                                              globalDefaults={globalUnitDefaults}
                                              generateFlatLabels={generateFlatLabels}
                                              isCollapsed={collapsedFloors[`${type}-${towerIdx}-0`]}
                                              onToggle={() => toggleFloorCollapse(`${type}-${towerIdx}`, 0)}
                                            />
                                          )}
                                          {/* Regular Floors */}
                                          {[...Array(parseInt(tower.floors) || 0)].map((_, i) => {
                                            const floorNum = i + 1;
                                            return (
                                              <FloorRow
                                                key={floorNum}
                                                towerIdx={`${type}-${towerIdx}`}
                                                floorNum={floorNum}
                                                floorName={`Floor ${floorNum}`}
                                                units={(typeUnits[type] || {})[towerIdx]?.[floorNum] || []}
                                                onAdd={() => addUnitToConfig(type, towerIdx, floorNum)}
                                                onRemove={(uIdx) => removeUnitFromConfig(type, towerIdx, floorNum, uIdx)}
                                                onUpdate={(uIdx, f, v) => updateUnitConfig(type, towerIdx, floorNum, uIdx, f, v)}
                                                onCopy={() => {
                                                  const prevFloor = floorNum - 1;
                                                  if (prevFloor >= 1) copyFloorConfig(type, towerIdx, prevFloor, floorNum);
                                                  else if (tower.hasGroundFloor) copyFloorConfig(type, towerIdx, 0, floorNum);
                                                }}
                                                projectType={type}
                                                globalDefaults={globalUnitDefaults}
                                                generateFlatLabels={generateFlatLabels}
                                                isCollapsed={collapsedFloors[`${type}-${towerIdx}-${floorNum}`]}
                                                onToggle={() => toggleFloorCollapse(`${type}-${towerIdx}`, floorNum)}
                                              />
                                            );
                                          })}
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="wizard-footer">
                <button className="secondary-btn" onClick={() => wizardStep > 1 ? setWizardStep(wizardStep - 1) : setShowWizard(false)}>
                  {wizardStep === 1 ? 'Cancel' : 'Back'}
                </button>
                <div className="filler"></div>
                {wizardStep < getWizardSteps().length ? (
                  <button
                    className="primary-btn"
                    onClick={() => setWizardStep(wizardStep + 1)}
                    disabled={!validateWizardStep(wizardStep)}
                  >
                    Next <ChevronRight size={18} />
                  </button>
                ) : (
                  <button className="primary-btn finish" onClick={handleCreateProject} disabled={saving || !validateWizardStep(wizardStep)}>
                    {saving ? 'Creating...' : 'Confirm & Generate'} <CheckCircle2 size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )
        }
      </AnimatePresence >

      <AdminUnitEditModal
        isOpen={showUnitEditModal}
        onClose={() => setShowUnitEditModal(false)}
        unit={editingUnit}
        onUpdate={handleUnitUpdate}
        projectType={selectedProject?.type}
      />

      {/* ADMIN ACTION MODAL */}
      <AnimatePresence>
        {showUnitActionModal && selectedUnit && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUnitActionModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl m-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              {selectedUnit.unit_image_url && (
                <div className="w-full h-40 mb-6 rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                  <img
                    src={selectedUnit.unit_image_url}
                    alt={`Unit ${selectedUnit.unit_number}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                  {(() => {
                    const type = (selectedUnit.unit_type || '').toLowerCase();
                    let Icon = LayoutGrid;
                    let color = 'text-slate-400';
                    let bg = 'bg-slate-50';

                    if (type.includes('flat')) { Icon = Home; color = 'text-blue-500'; bg = 'bg-blue-50'; }
                    else if (type.includes('shop')) { Icon = ShoppingBag; color = 'text-orange-500'; bg = 'bg-orange-50'; }
                    else if (type.includes('office')) { Icon = Briefcase; color = 'text-purple-500'; bg = 'bg-purple-50'; }
                    else if (type.includes('showroom')) { Icon = Store; color = 'text-rose-500'; bg = 'bg-rose-50'; }
                    else if (type.includes('basement') || type.includes('storage')) { Icon = Box; color = 'text-slate-500'; bg = 'bg-slate-50'; }
                    else if (type.includes('parking')) { Icon = Car; color = 'text-emerald-500'; bg = 'bg-emerald-50'; }

                    return (
                      <div className={`p-3 rounded-2xl ${bg} ${color}`}>
                        <Icon size={32} />
                      </div>
                    );
                  })()}
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">Unit {selectedUnit.unit_number}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{selectedUnit.unit_type}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{selectedUnit.area} SQ FT</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowUnitActionModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className={`font-bold uppercase tracking-tight ${selectedUnit.status === 'available' ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {selectedUnit.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Area</span>
                  <span className="font-bold text-slate-700">{selectedUnit.area} SQ FT</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Rate (₹/Sqft)</span>
                  <div className="text-right">
                    {selectedUnit.discount_price_per_sqft ? (
                      <>
                        <span className="text-xs text-slate-400 line-through mr-2">₹{selectedUnit.price_per_sqft}</span>
                        <span className="font-bold text-emerald-600">₹{selectedUnit.discount_price_per_sqft}</span>
                      </>
                    ) : (
                      <span className="font-bold text-slate-700">₹{selectedUnit.price_per_sqft || 0}</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-end pt-2 border-t border-slate-100">
                  <span className="text-slate-500 text-sm">Final Price</span>
                  <div className="text-right">
                    {selectedUnit.discount_price_per_sqft && (
                      <span className="text-xs text-slate-400 line-through block leading-none mb-1">
                        ₹{((selectedUnit.area * selectedUnit.price_per_sqft) / 100000).toFixed(2)} L
                      </span>
                    )}
                    <span className="font-black text-slate-900 text-xl leading-none">
                      ₹{(selectedUnit.price / 100000).toFixed(2)} L
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {selectedUnit.status === 'available' && (
                  <>
                    <button
                      className="w-full py-3 rounded-xl bg-amber-50 text-amber-700 font-bold border border-amber-200 hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                      onClick={() => handleAdminAction('lock')}
                      disabled={actionLoading}
                    >
                      <Lock size={18} /> {actionLoading ? 'Processing...' : 'Hold Unit (Lock)'}
                    </button>
                    <button
                      className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                      onClick={() => handleAdminAction('book')}
                      disabled={actionLoading}
                    >
                      <DollarSign size={18} /> {actionLoading ? 'Processing...' : 'Mark as Booked'}
                    </button>
                  </>
                )}
                {selectedUnit.status !== 'available' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-100 rounded-xl text-center text-slate-500 text-xs mb-2">
                      Unit is currently <strong>{selectedUnit.status}</strong>
                    </div>
                    <button
                      className="w-full py-3 rounded-xl bg-orange-50 text-orange-600 font-bold border border-orange-200 hover:bg-orange-100 transition-colors flex items-center justify-center gap-2"
                      onClick={() => handleAdminAction('release')}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Releasing...' : 'Release / Unbook Unit'} <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div >
  );
};

// Helper Component for Unit Configurator
const FloorRow = ({ floorName, units, onAdd, onRemove, onUpdate, onCopy, projectType, globalDefaults, generateFlatLabels, isCollapsed, onToggle }) => {
  const getUnitOptions = () => {
    if (projectType === 'Commercial') {
      return ['Shop', 'Office', 'Showroom', 'Commercial Unit', 'Parking', 'Storage'];
    }
    return ['Flat', 'Shop', 'Showroom', 'Office', 'Penthouse', 'Villa', 'Plot', 'Parking', 'Storage'];
  };

  const unitOptions = getUnitOptions();
  const flatLabelOptions = generateFlatLabels(Math.max(units.length + 5, 10)); // Provide more options than current units

  return (
    <div className="floor-row-config border-b pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className="p-1 hover:bg-slate-100 rounded-md transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </button>
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{floorName}</h4>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
            {units.length} Units
          </span>
        </div>
        <div className="flex gap-2">
          {onCopy && (
            <button onClick={onCopy} className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-all">
              <RefreshCw size={10} /> Copy Previous
            </button>
          )}
          <button onClick={onAdd} className="text-[10px] text-emerald-600 hover:text-emerald-800 flex items-center gap-1 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 transition-all">
            <Plus size={10} /> Add Unit
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="floor-row-units-content">
          {units.length === 0 ? (
            <div className="p-4 bg-white/50 border border-dashed rounded-xl text-center">
              <p className="text-xs text-slate-400 italic">No units configured for this floor.</p>
            </div>
          ) : (
            <div className="units-sub-grid">
              {units.map((unit, uIdx) => {
                const area = parseFloat(unit.area) || 0;
                const pricingArea = (unit.pricing_area && parseFloat(unit.pricing_area) > 0) ? parseFloat(unit.pricing_area) : area;
                const regSqft = parseFloat(unit.price_per_sqft) || 0;
                const discSqft = (unit.discount_price_per_sqft !== '' && unit.discount_price_per_sqft !== null) ? parseFloat(unit.discount_price_per_sqft) : null;
                const finalPrice = discSqft !== null ? pricingArea * discSqft : pricingArea * regSqft;

                return (
                  <div key={uIdx} className={`unit-mini-card relative group ${unit.isCustom ? 'is-custom border-blue-400' : 'is-default opacity-90'}`}>
                    <div className="status-badge-container absolute top-2 right-2 flex gap-1 z-10">
                      <span className={`status-indicator text-[8px] font-bold px-1.5 py-0.5 rounded-full ${unit.isCustom ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                        {unit.isCustom ? 'Custom' : 'Default'}
                      </span>
                      <button
                        onClick={() => onRemove(uIdx)}
                        className="bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md"
                      >
                        <X size={10} />
                      </button>
                    </div>

                    <div className="card-inner-layout p-3">
                      <div className="unit-card-header border-b border-slate-100 pb-2 mb-2">
                        <div className="flex flex-col gap-1 w-full">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Flat Label</label>
                          <select
                            className={`text-xs font-bold p-1 rounded border transition-colors ${!unit.isCustom ? 'bg-slate-50 border-transparent cursor-not-allowed text-slate-500' : 'bg-white border-slate-200 text-slate-800 focus:border-blue-400 outline-none'}`}
                            value={unit.flat_label}
                            onChange={e => {
                              const val = e.target.value;
                              const isConflict = units.some((u, idx) => idx !== uIdx && u.flat_label === val);
                              if (isConflict) {
                                alert("This flat label is already used on this floor.");
                                return;
                              }
                              onUpdate(uIdx, 'flat_label', val);
                              onUpdate(uIdx, 'unit_number', val);
                            }}
                            disabled={!unit.isCustom}
                          >
                            {flatLabelOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="unit-card-body space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="input-field-group">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Unit Type</label>
                            <select
                              className="text-[10px] border rounded p-1 w-full disabled:bg-slate-50 disabled:text-slate-400"
                              value={unit.unit_type || ''}
                              onChange={e => onUpdate(uIdx, 'unit_type', e.target.value)}
                              disabled={!unit.isCustom}
                            >
                              {unitOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                          <div className="input-field-group">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">SBUA (SqFt)</label>
                            <input
                              type="number"
                              className="text-[10px] border rounded p-1 w-full disabled:bg-slate-50 disabled:text-slate-400"
                              value={unit.area || ''}
                              onChange={e => onUpdate(uIdx, 'area', parseFloat(e.target.value) || 0)}
                              disabled={!unit.isCustom}
                            />
                          </div>
                          <div className="input-field-group">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Carpet (SqFt)</label>
                            <input
                              type="number"
                              className="text-[10px] border rounded p-1 w-full disabled:bg-slate-50 disabled:text-slate-400"
                              value={unit.carpet_area || ''}
                              onChange={e => onUpdate(uIdx, 'carpet_area', e.target.value)}
                              disabled={!unit.isCustom}
                            />
                          </div>
                          <div className="input-field-group">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Reg. Rate</label>
                            <input
                              type="number"
                              className="text-[10px] border rounded p-1 w-full disabled:bg-slate-50 disabled:text-slate-400"
                              value={unit.price_per_sqft || ''}
                              onChange={e => onUpdate(uIdx, 'price_per_sqft', e.target.value)}
                              disabled={!unit.isCustom}
                            />
                          </div>
                          <div className="input-field-group col-span-2">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Discount Rate</label>
                            <input
                              type="number"
                              className="text-[10px] border rounded p-1 w-full disabled:bg-slate-50 disabled:text-slate-400"
                              value={unit.discount_price_per_sqft || ''}
                              onChange={e => onUpdate(uIdx, 'discount_price_per_sqft', e.target.value)}
                              disabled={!unit.isCustom}
                            />
                          </div>
                        </div>

                        <div className="action-buttons flex justify-between items-center">
                          {!unit.isCustom ? (
                            <button
                              onClick={() => onUpdate(uIdx, 'isCustom', true)}
                              className="text-[9px] font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2"
                            >
                              Customize / Edit
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (window.confirm("Reset this unit to global defaults?")) {
                                  onUpdate(uIdx, 'isCustom', false);
                                  // Revert to defaults
                                  onUpdate(uIdx, 'unit_type', globalDefaults.unitType);
                                  onUpdate(uIdx, 'area', globalDefaults.sbua);
                                  onUpdate(uIdx, 'carpet_area', globalDefaults.carpetArea);
                                  onUpdate(uIdx, 'price_per_sqft', globalDefaults.baseRate);
                                  onUpdate(uIdx, 'discount_price_per_sqft', globalDefaults.discountRate);

                                  const label = `Flat ${String.fromCharCode(65 + uIdx)}`;
                                  onUpdate(uIdx, 'flat_label', label);
                                  onUpdate(uIdx, 'unit_number', label);
                                }
                              }}
                              className="text-[9px] font-bold text-green-600 hover:text-green-700 underline underline-offset-2"
                            >
                              Use Default
                            </button>
                          )}
                        </div>

                        <div className="pricing-row-display flex justify-between items-center mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <div className="flex flex-col">
                            <span className="text-[8px] text-slate-400 font-bold uppercase">Total Price</span>
                            {discSqft !== null && (
                              <span className="strikethrough-price text-[8px] text-slate-400 font-bold line-through">
                                {(() => {
                                  const val = area * regSqft;
                                  if (val === 0) return '₹0';
                                  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
                                  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
                                  return `₹${val.toLocaleString('en-IN')}`;
                                })()}
                              </span>
                            )}
                          </div>
                          <span className="final-price-tag text-indigo-700 font-bold text-xs">
                            {(() => {
                              if (finalPrice <= 0) return '₹0';
                              if (finalPrice >= 10000000) return `₹${(finalPrice / 10000000).toFixed(2)} Cr`;
                              if (finalPrice >= 100000) return `₹${(finalPrice / 100000).toFixed(2)} L`;
                              return `₹${finalPrice.toLocaleString('en-IN')}`;
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Bungalow Grid Component
const BungalowGrid = ({ units, onUpdate, onRemove, onAdd, globalDefaults, projectType }) => {


  return (
    <div className="bungalow-grid-container">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Bungalow Units</h4>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
            {units.length} Units
          </span>
        </div>
        <button onClick={onAdd} className="text-[10px] text-emerald-600 hover:text-emerald-800 flex items-center gap-1 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 transition-all">
          <Plus size={10} /> Add Unit
        </button>
      </div>

      <div className="units-sub-grid">
        {units.map((unit, uIdx) => {
          // Determine Effective Values: specific if custom, global default if default
          const area = unit.isCustom
            ? (parseFloat(unit.area) || 0)
            : (parseFloat(globalDefaults.sbua) || 0);

          const regSqft = unit.isCustom
            ? (parseFloat(unit.price_per_sqft) || 0)
            : (parseFloat(globalDefaults.baseRate) || 0);

          let discSqft = null;
          if (unit.isCustom) {
            discSqft = (unit.discount_price_per_sqft !== '' && unit.discount_price_per_sqft !== null)
              ? parseFloat(unit.discount_price_per_sqft)
              : null;
          } else {
            discSqft = (globalDefaults.discountRate !== '' && globalDefaults.discountRate !== null)
              ? parseFloat(globalDefaults.discountRate)
              : null;
          }

          // fallback to regular price if discount is not set (null)
          const finalPrice = discSqft !== null ? area * discSqft : area * regSqft;

          return (
            <div key={uIdx} className={`unit-mini-card relative group ${unit.isCustom ? 'is-custom border-blue-400' : 'is-default opacity-90'}`}>
              <div className="status-badge-container absolute top-2 right-2 flex gap-1 z-10">
                <span className={`status-indicator text-[8px] font-bold px-1.5 py-0.5 rounded-full ${unit.isCustom ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                  {unit.isCustom ? 'Custom' : 'Default'}
                </span>
                <button
                  onClick={() => onRemove(uIdx)}
                  className="bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md"
                >
                  <X size={10} />
                </button>
              </div>

              <div className="card-inner-layout p-3">
                {/* UNIT IMAGE PREVIEW */}
                {(unit.unit_image_url || unit.localImagePreview) && (
                  <div className="unit-card-image mb-3 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 h-28 w-full group-hover:h-32 transition-all duration-300">
                    <img
                      src={unit.localImagePreview || unit.unit_image_url}
                      alt="Unit Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="unit-card-header border-b border-slate-100 pb-2 mb-2">
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Unit Label</label>
                    <input
                      type="text"
                      className={`text-xs font-bold p-1 rounded border transition-colors ${!unit.isCustom ? 'bg-slate-50 border-transparent cursor-not-allowed text-slate-500' : 'bg-white border-slate-200 text-slate-800 focus:border-blue-400 outline-none'}`}
                      value={unit.unit_number || ''}
                      onChange={e => onUpdate(uIdx, 'unit_number', e.target.value)}
                      disabled={!unit.isCustom}
                    />
                  </div>
                </div>

                <div className="unit-card-body space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="input-field-group">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Unit Type</label>
                      <select
                        className="text-[10px] border rounded p-1 w-full disabled:bg-slate-50 disabled:text-slate-400"
                        value={unit.unit_type || 'Villa'}
                        onChange={e => onUpdate(uIdx, 'unit_type', e.target.value)}
                        disabled={!unit.isCustom}
                      >
                        <option value="Villa">Villa</option>
                        <option value="Bungalow">Bungalow</option>
                        <option value="Row House">Row House</option>
                        <option value="Twin Villa">Twin Villa</option>
                        <option value="Plot">Plot</option>
                      </select>
                    </div>
                    <div className="input-field-group">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Area (SqFt)</label>
                      <input
                        type="number"
                        className="text-[10px] border rounded p-1 w-full disabled:bg-slate-50 disabled:text-slate-400"
                        value={unit.area || ''}
                        onChange={e => onUpdate(uIdx, 'area', parseFloat(e.target.value) || 0)}
                        disabled={!unit.isCustom}
                      />
                    </div>
                    <div className="input-field-group">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Regular Price</label>
                      <input
                        type="number"
                        className="text-[10px] border rounded p-1 w-full disabled:bg-slate-50 disabled:text-slate-400"
                        value={unit.price_per_sqft || ''}
                        onChange={e => onUpdate(uIdx, 'price_per_sqft', e.target.value)}
                        placeholder={!unit.isCustom ? globalDefaults.baseRate : ''}
                        disabled={!unit.isCustom}
                      />
                    </div>
                    <div className="input-field-group">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Discount Price</label>
                      <input
                        type="number"
                        className="text-[10px] border rounded p-1 w-full disabled:bg-slate-50 disabled:text-slate-400"
                        value={unit.discount_price_per_sqft || ''}
                        onChange={e => onUpdate(uIdx, 'discount_price_per_sqft', e.target.value)}
                        placeholder={!unit.isCustom ? globalDefaults.discountRate : ''}
                        disabled={!unit.isCustom}
                      />
                    </div>
                  </div>

                  {/* PLOT DIMENSIONS - Only for Plot units */}
                  {/* PLOT DIMENSIONS - Shown for all units in land-based projects or Plot types */}
                  {(unit.unit_type === 'Plot' || projectData.type === 'residential_land') && (
                    <>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="input-field-group">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Plot Width (ft)</label>
                          <input
                            type="number"
                            className="text-[10px] border rounded p-1 w-full disabled:bg-slate-50 disabled:text-slate-400"
                            value={unit.plot_width || ''}
                            onChange={e => onUpdate(uIdx, 'plot_width', parseFloat(e.target.value) || 0)}
                            disabled={!unit.isCustom}
                            placeholder="e.g. 30"
                          />
                        </div>
                        <div className="input-field-group">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Plot Depth (ft)</label>
                          <input
                            type="number"
                            className="text-[10px] border rounded p-1 w-full disabled:bg-slate-50 disabled:text-slate-400"
                            value={unit.plot_depth || ''}
                            onChange={e => onUpdate(uIdx, 'plot_depth', parseFloat(e.target.value) || 0)}
                            disabled={!unit.isCustom}
                            placeholder="e.g. 40"
                          />
                        </div>
                      </div>

                      {/* Four Side Dimensions */}
                      <div className="mt-3 p-2 bg-blue-50/30 rounded-lg border border-blue-100/50">
                        <label className="text-[9px] font-bold text-blue-600 uppercase mb-2 block">Visual Side Dimensions (optional)</label>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                          <div className="input-field-group">
                            <label className="text-[8px] font-semibold text-slate-500 uppercase">Front (ft)</label>
                            <input
                              type="number"
                              className="text-[10px] border rounded p-1 w-full bg-white"
                              value={unit.front_side || ''}
                              onChange={e => onUpdate(uIdx, 'front_side', e.target.value)}
                              disabled={!unit.isCustom}
                              placeholder="Front"
                            />
                          </div>
                          <div className="input-field-group">
                            <label className="text-[8px] font-semibold text-slate-500 uppercase">Back (ft)</label>
                            <input
                              type="number"
                              className="text-[10px] border rounded p-1 w-full bg-white"
                              value={unit.back_side || ''}
                              onChange={e => onUpdate(uIdx, 'back_side', e.target.value)}
                              disabled={!unit.isCustom}
                              placeholder="Back"
                            />
                          </div>
                          <div className="input-field-group">
                            <label className="text-[8px] font-semibold text-slate-500 uppercase">Left (ft)</label>
                            <input
                              type="number"
                              className="text-[10px] border rounded p-1 w-full bg-white"
                              value={unit.left_side || ''}
                              onChange={e => onUpdate(uIdx, 'left_side', e.target.value)}
                              disabled={!unit.isCustom}
                              placeholder="Left"
                            />
                          </div>
                          <div className="input-field-group">
                            <label className="text-[8px] font-semibold text-slate-500 uppercase">Right (ft)</label>
                            <input
                              type="number"
                              className="text-[10px] border rounded p-1 w-full bg-white"
                              value={unit.right_side || ''}
                              onChange={e => onUpdate(uIdx, 'right_side', e.target.value)}
                              disabled={!unit.isCustom}
                              placeholder="Right"
                            />
                          </div>
                        </div>
                        <p className="text-[8px] text-blue-400 mt-1 italic">Note: These values are for 3D visual display only.</p>
                      </div>
                    </>
                  )}

                  {/* UNIT IMAGE UPLOAD - Only for Custom Units */}
                  {unit.isCustom && (
                    <div className="unit-image-upload mt-2 pt-2 border-t border-slate-50">
                      <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Unit Image</label>
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors">
                          <ImageIcon size={12} />
                          {unit.unit_image_url || unit.localImagePreview ? 'Change Image' : 'Upload Image'}
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  onUpdate(uIdx, 'localImagePreview', reader.result);
                                  onUpdate(uIdx, 'unit_image_file', file);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        {(unit.unit_image_url || unit.localImagePreview) && (
                          <button
                            onClick={() => {
                              onUpdate(uIdx, 'unit_image_url', null);
                              onUpdate(uIdx, 'localImagePreview', null);
                              onUpdate(uIdx, 'unit_image_file', null);
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove Image"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="action-buttons flex justify-between items-center">
                    {!unit.isCustom ? (
                      <button
                        onClick={() => onUpdate(uIdx, 'isCustom', true)}
                        className="text-[9px] font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2"
                      >
                        Customize / Edit
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (window.confirm("Reset this bungalow to global defaults?")) {
                            onUpdate(uIdx, 'isCustom', false);
                            onUpdate(uIdx, 'unit_type', globalDefaults.unitType);
                            onUpdate(uIdx, 'area', globalDefaults.sbua);
                            onUpdate(uIdx, 'price_per_sqft', globalDefaults.baseRate);
                            onUpdate(uIdx, 'discount_price_per_sqft', globalDefaults.discountRate);
                            onUpdate(uIdx, 'unit_image_url', null);
                            onUpdate(uIdx, 'localImagePreview', null);
                            onUpdate(uIdx, 'unit_image_file', null);
                          }
                        }}
                        className="text-[9px] font-bold text-green-600 hover:text-green-700 underline underline-offset-2"
                      >
                        Use Default
                      </button>
                    )}
                  </div>

                  <div className="pricing-row-display flex justify-between items-center mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-slate-400 font-bold uppercase">Total Price</span>
                      <span className="final-price-tag text-indigo-700 font-bold text-sm">
                        ₹{(finalPrice / 100000).toFixed(2)} L
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminLiveGrouping;
