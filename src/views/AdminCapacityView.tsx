import React, { useState, useMemo } from 'react';
import { Shield, TrendingUp, Users, Activity, AlertTriangle, Save, RotateCcw, Filter, Calendar, BarChart3, ScatterChart as Scatter, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useProjects } from '../hooks/useProjects';

// Extended types for capacity management
interface ExtendedProject {
  id: string;
  name: string;
  pieces: number;
  size: 'small' | 'medium' | 'large';
  geometry: 'simple' | 'medium' | 'complex';
  delivery_date: string;
  target_cost_constraint: number;
  previewed_be_hours: number;
  modelling: 'none' | 'basic' | 'advanced';
  outsourced_suppliers: number;
  d_level_override?: number;
}

interface Staff {
  id: string;
  name: string;
  weekly_capacity_hours: number;
  active: boolean;
}

interface Assignment {
  project_id: string;
  staff_id: string;
  planned_hours: number;
  staff_reported_percent_complete: number;
  staff_reported_hours_remaining?: number;
}

interface TimeLog {
  project_id: string;
  staff_id: string;
  date: string;
  hours: number;
}

interface Config {
  w_geometry: number;
  w_pieces: number;
  w_size: number;
  w_urgency: number;
  w_cost: number;
  w_modelling: number;
  w_outsourcing: number;
  w_previewed_hours: number;
  lead_time_ref_days: number;
  previewed_hours_ref: number;
  pieces_cap: number;
}

// Mock data
const MOCK_EXTENDED_PROJECTS: ExtendedProject[] = [
  {
    id: '1',
    name: 'Project Alpha',
    pieces: 25,
    size: 'large',
    geometry: 'complex',
    delivery_date: '2024-04-30',
    target_cost_constraint: 15000,
    previewed_be_hours: 120,
    modelling: 'advanced',
    outsourced_suppliers: 2,
    d_level_override: undefined
  },
  {
    id: '2',
    name: 'Project Beta',
    pieces: 12,
    size: 'medium',
    geometry: 'medium',
    delivery_date: '2024-05-15',
    target_cost_constraint: 22000,
    previewed_be_hours: 150,
    modelling: 'basic',
    outsourced_suppliers: 1
  },
  {
    id: '3',
    name: 'Project Gamma',
    pieces: 8,
    size: 'small',
    geometry: 'simple',
    delivery_date: '2024-03-30',
    target_cost_constraint: 8000,
    previewed_be_hours: 200,
    modelling: 'none',
    outsourced_suppliers: 0,
    d_level_override: 7.5
  }
];

const MOCK_STAFF: Staff[] = [
  { id: 'as', name: 'ALEXANDER SMITH', weekly_capacity_hours: 40, active: true },
  { id: 'mr', name: 'MAËLYS DE LA RUÉE', weekly_capacity_hours: 40, active: true },
  { id: 'aq', name: 'ALEXIA QUENTIN', weekly_capacity_hours: 35, active: true },
  { id: 'sr', name: 'STEPHANIE DE RORTHAYS', weekly_capacity_hours: 40, active: true },
  { id: 'ld', name: 'LITESH DHUNNOO', weekly_capacity_hours: 40, active: false },
  { id: 'ps', name: 'PASCALINE SOLEILHAC', weekly_capacity_hours: 35, active: true },
  { id: 'nr', name: 'NICHOLAS RASCO', weekly_capacity_hours: 40, active: true }
];

const MOCK_ASSIGNMENTS: Assignment[] = [
  { project_id: '1', staff_id: 'as', planned_hours: 60, staff_reported_percent_complete: 75, staff_reported_hours_remaining: 15 },
  { project_id: '1', staff_id: 'mr', planned_hours: 60, staff_reported_percent_complete: 60, staff_reported_hours_remaining: 25 },
  { project_id: '2', staff_id: 'mr', planned_hours: 150, staff_reported_percent_complete: 30, staff_reported_hours_remaining: 105 },
  { project_id: '3', staff_id: 'aq', planned_hours: 120, staff_reported_percent_complete: 90, staff_reported_hours_remaining: 12 },
  { project_id: '3', staff_id: 'sr', planned_hours: 80, staff_reported_percent_complete: 85, staff_reported_hours_remaining: 12 }
];

const MOCK_TIME_LOGS: TimeLog[] = [
  { project_id: '1', staff_id: 'as', date: '2024-01-20', hours: 8 },
  { project_id: '1', staff_id: 'as', date: '2024-01-21', hours: 7.5 },
  { project_id: '1', staff_id: 'mr', date: '2024-01-22', hours: 6 },
  { project_id: '2', staff_id: 'mr', date: '2024-01-23', hours: 8 },
  { project_id: '3', staff_id: 'aq', date: '2024-01-24', hours: 8 },
  { project_id: '3', staff_id: 'sr', date: '2024-01-25', hours: 7 }
];

const DEFAULT_CONFIG: Config = {
  w_geometry: 0.15,
  w_pieces: 0.10,
  w_size: 0.10,
  w_urgency: 0.25,
  w_cost: 0.15,
  w_modelling: 0.10,
  w_outsourcing: 0.05,
  w_previewed_hours: 0.10,
  lead_time_ref_days: 90,
  previewed_hours_ref: 100,
  pieces_cap: 50
};

export const AdminCapacityView: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // State
  const [horizonWeeks, setHorizonWeeks] = useState(12);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>(MOCK_STAFF.filter(s => s.active).map(s => s.id));
  const [projectFilter, setProjectFilter] = useState('all');
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [tempOverride, setTempOverride] = useState<Record<string, string>>({});

  // Access control
  if (user?.role !== 'admin') {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Administrator privileges required to access capacity management.</p>
        </div>
      </div>
    );
  }

  // Calculations
  const calculations = useMemo(() => {
    // Calculate scores for each project
    const projectsWithScores = MOCK_EXTENDED_PROJECTS.map(project => {
      const deliveryDate = new Date(project.delivery_date);
      const asOf = new Date(asOfDate);
      const daysUntilDelivery = Math.ceil((deliveryDate.getTime() - asOf.getTime()) / (1000 * 60 * 60 * 24));
      
      // Normalize scores (0-1)
      const piecesScore = Math.min(project.pieces / config.pieces_cap, 1);
      const sizeScore = project.size === 'small' ? 0.2 : project.size === 'medium' ? 0.6 : 1.0;
      const geometryScore = project.geometry === 'simple' ? 0.2 : project.geometry === 'medium' ? 0.6 : 1.0;
      const urgencyScore = Math.max(0, Math.min(1, (config.lead_time_ref_days - daysUntilDelivery) / config.lead_time_ref_days));
      const costScore = Math.max(0, Math.min(1, (20000 - project.target_cost_constraint) / 20000));
      const modellingScore = project.modelling === 'none' ? 0 : project.modelling === 'basic' ? 0.5 : 1.0;
      const outsourcingScore = Math.min(project.outsourced_suppliers / 5, 1);
      const previewedHoursScore = Math.min(project.previewed_be_hours / config.previewed_hours_ref, 1);
      
      // Weighted sum
      const weightedSum = 
        piecesScore * config.w_pieces +
        sizeScore * config.w_size +
        geometryScore * config.w_geometry +
        urgencyScore * config.w_urgency +
        costScore * config.w_cost +
        modellingScore * config.w_modelling +
        outsourcingScore * config.w_outsourcing +
        previewedHoursScore * config.w_previewed_hours;
      
      // D-Level calculation
      const computedDLevel = Math.round((1 + 9 * weightedSum) * 10) / 10;
      const finalDLevel = overrides[project.id] || project.d_level_override || computedDLevel;
      
      // Risk calculation
      const risk = finalDLevel * (1 + urgencyScore);
      
      return {
        ...project,
        scores: {
          pieces: piecesScore,
          size: sizeScore,
          geometry: geometryScore,
          urgency: urgencyScore,
          cost: costScore,
          modelling: modellingScore,
          outsourcing: outsourcingScore,
          previewed_hours: previewedHoursScore
        },
        weighted_sum: weightedSum,
        computed_d_level: computedDLevel,
        final_d_level: finalDLevel,
        risk: risk,
        days_until_delivery: daysUntilDelivery
      };
    });

    // Calculate staff capacity
    const staffWithCapacity = MOCK_STAFF.filter(s => selectedStaff.includes(s.id)).map(staff => {
      const availableHours = staff.weekly_capacity_hours * horizonWeeks;
      
      // Get assignments for this staff member
      const staffAssignments = MOCK_ASSIGNMENTS.filter(a => a.staff_id === staff.id);
      
      // Calculate workload hours
      const workloadHours = staffAssignments.reduce((total, assignment) => {
        const project = projectsWithScores.find(p => p.id === assignment.project_id);
        if (!project) return total;
        
        // Calculate remaining hours for this assignment
        let remainingHours = 0;
        
        if (assignment.staff_reported_hours_remaining !== undefined) {
          remainingHours = assignment.staff_reported_hours_remaining;
        } else {
          const percentComplete = assignment.staff_reported_percent_complete || 0;
          remainingHours = assignment.planned_hours * (1 - percentComplete / 100);
        }
        
        return total + Math.max(0, remainingHours);
      }, 0);
      
      const utilisation = availableHours > 0 ? (workloadHours / availableHours) * 100 : 0;
      const freeCapacity = Math.max(0, availableHours - workloadHours);
      
      // Calculate risk load
      const riskLoad = staffAssignments.reduce((total, assignment) => {
        const project = projectsWithScores.find(p => p.id === assignment.project_id);
        if (!project) return total;
        return total + (project.final_d_level * project.scores.urgency);
      }, 0);
      
      return {
        ...staff,
        available_hours: availableHours,
        workload_hours: workloadHours,
        utilisation: utilisation,
        free_capacity: freeCapacity,
        risk_load: riskLoad,
        assignments: staffAssignments
      };
    });

    // Calculate KPIs
    const totalActiveProjects = projectsWithScores.length;
    const totalStaff = staffWithCapacity.filter(s => s.active).length;
    const avgDLevel = projectsWithScores.reduce((sum, p) => sum + p.final_d_level, 0) / projectsWithScores.length;
    const globalUtilisation = staffWithCapacity.reduce((sum, s) => sum + s.utilisation, 0) / staffWithCapacity.length;

    return {
      projectsWithScores: projectsWithScores.sort((a, b) => b.risk - a.risk),
      staffWithCapacity: staffWithCapacity.sort((a, b) => b.utilisation - a.utilisation),
      kpis: {
        totalActiveProjects,
        totalStaff,
        avgDLevel: Math.round(avgDLevel * 10) / 10,
        globalUtilisation: Math.round(globalUtilisation)
      }
    };
  }, [horizonWeeks, asOfDate, selectedStaff, projectFilter, config, overrides]);

  // Check if weights sum to 100%
  const weightsSum = Object.values(config).slice(0, 8).reduce((sum, weight) => sum + weight, 0);
  const weightsValid = Math.abs(weightsSum - 1.0) < 0.01;

  const handleConfigChange = (key: keyof Config, value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveOverride = (projectId: string) => {
    const value = tempOverride[projectId];
    if (value && !isNaN(parseFloat(value))) {
      const numValue = Math.max(1, Math.min(10, parseFloat(value)));
      setOverrides(prev => ({ ...prev, [projectId]: numValue }));
      setTempOverride(prev => ({ ...prev, [projectId]: '' }));
    }
  };

  const handleClearOverride = (projectId: string) => {
    setOverrides(prev => {
      const newOverrides = { ...prev };
      delete newOverrides[projectId];
      return newOverrides;
    });
    setTempOverride(prev => ({ ...prev, [projectId]: '' }));
  };

  const resetConfig = () => {
    if (confirm('Reset all configuration to default values?')) {
      setConfig(DEFAULT_CONFIG);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="h-8 w-8 mr-3 text-red-600" />
            Admin — Capacity & D-Level
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Advanced capacity planning and difficulty level analysis
          </p>
        </div>
        
        <button
          onClick={() => setShowConfigPanel(!showConfigPanel)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          <BarChart3 className="h-4 w-4" />
          <span>Configuration</span>
        </button>
      </div>

      {/* Weights Warning */}
      {!weightsValid && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Configuration Warning</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Weights sum to {Math.round(weightsSum * 100)}% instead of 100%. Please adjust configuration.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horizon (weeks)
            </label>
            <input
              type="number"
              min="1"
              max="52"
              value={horizonWeeks}
              onChange={(e) => setHorizonWeeks(parseInt(e.target.value) || 12)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              As-of Date
            </label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff Filter
            </label>
            <select
              multiple
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(Array.from(e.target.selectedOptions, option => option.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              size={3}
            >
              {MOCK_STAFF.map(staff => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} {!staff.active && '(Inactive)'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Filter
            </label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Projects</option>
              <option value="high_risk">High Risk (D-Level &gt; 7)</option>
              <option value="overdue">Overdue</option>
              <option value="urgent">Urgent (&lt; 30 days)</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">{calculations.kpis.totalActiveProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Staff</p>
              <p className="text-2xl font-bold text-gray-900">{calculations.kpis.totalStaff}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg D-Level</p>
              <p className="text-2xl font-bold text-gray-900">{calculations.kpis.avgDLevel}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Global Utilisation</p>
              <p className="text-2xl font-bold text-gray-900">{calculations.kpis.globalUtilisation}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects D-Level Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Projects D-Level Analysis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pieces</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Geometry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelling</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outsourcing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">D-Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {calculations.projectsWithScores.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                    <div className="text-sm text-gray-500">{project.pieces} pieces</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(project.delivery_date).toLocaleDateString('fr-FR')}
                    </div>
                    <div className={`text-xs ${
                      project.days_until_delivery < 30 ? 'text-red-600' :
                      project.days_until_delivery < 60 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {project.days_until_delivery} days
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.round(project.scores.pieces * 100)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.round(project.scores.size * 100)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.round(project.scores.geometry * 100)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.round(project.scores.urgency * 100)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.round(project.scores.cost * 100)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.round(project.scores.modelling * 100)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.round(project.scores.outsourcing * 100)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.round(project.scores.previewed_hours * 100)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        project.final_d_level >= 8 ? 'bg-red-100 text-red-800' :
                        project.final_d_level >= 6 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {project.final_d_level}
                      </span>
                      {(overrides[project.id] || project.d_level_override) && (
                        <span className="text-xs text-blue-600">Override</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      project.risk >= 8 ? 'bg-red-100 text-red-800' :
                      project.risk >= 5 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {Math.round(project.risk * 10) / 10}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        step="0.1"
                        value={tempOverride[project.id] || ''}
                        onChange={(e) => setTempOverride(prev => ({ ...prev, [project.id]: e.target.value }))}
                        placeholder={project.computed_d_level.toString()}
                        className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleSaveOverride(project.id)}
                        disabled={!tempOverride[project.id]}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Save
                      </button>
                      {(overrides[project.id] || project.d_level_override) && (
                        <button
                          onClick={() => handleClearOverride(project.id)}
                          className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Capacity Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Staff Capacity Analysis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weekly Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workload Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisation %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Free Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Load</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {calculations.staffWithCapacity.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {staff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                        <div className={`text-xs ${staff.active ? 'text-green-600' : 'text-red-600'}`}>
                          {staff.active ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {staff.weekly_capacity_hours}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {staff.available_hours}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.round(staff.workload_hours)}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            staff.utilisation > 100 ? 'bg-red-600' :
                            staff.utilisation > 80 ? 'bg-yellow-600' :
                            'bg-green-600'
                          }`}
                          style={{ width: `${Math.min(staff.utilisation, 100)}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${
                        staff.utilisation > 100 ? 'text-red-600' :
                        staff.utilisation > 80 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {Math.round(staff.utilisation)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.round(staff.free_capacity)}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      staff.risk_load >= 20 ? 'bg-red-100 text-red-800' :
                      staff.risk_load >= 10 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {Math.round(staff.risk_load * 10) / 10}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* D-Level vs Hours Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Scatter className="h-5 w-5 mr-2" />
            D-Level vs Actual Hours
          </h3>
          <div className="relative h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Scatter plot visualization</p>
              <p className="text-xs">D-Level complexity vs actual hours logged</p>
            </div>
          </div>
        </div>

        {/* Staff Free Capacity Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Free Capacity by Staff</h3>
          <div className="space-y-3">
            {calculations.staffWithCapacity.map((staff) => {
              const maxCapacity = Math.max(...calculations.staffWithCapacity.map(s => s.available_hours));
              const capacityPercentage = (staff.free_capacity / maxCapacity) * 100;
              
              return (
                <div key={staff.id} className="flex items-center space-x-3">
                  <div className="w-24 text-sm font-medium text-gray-900 truncate">
                    {staff.name.split(' ')[0]}
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-green-600 h-4 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                        style={{ width: `${capacityPercentage}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          {Math.round(staff.free_capacity)}h
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-16 text-sm font-semibold text-gray-900 text-right">
                    {Math.round(staff.utilisation)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfigPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">D-Level Configuration</h3>
              <button
                onClick={() => setShowConfigPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* Weights */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    Scoring Weights (Total: {Math.round(weightsSum * 100)}%)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'w_geometry', label: 'Geometry Complexity' },
                      { key: 'w_pieces', label: 'Number of Pieces' },
                      { key: 'w_size', label: 'Size Factor' },
                      { key: 'w_urgency', label: 'Urgency (Delivery)' },
                      { key: 'w_cost', label: 'Cost Constraint' },
                      { key: 'w_modelling', label: 'Modelling Required' },
                      { key: 'w_outsourcing', label: 'Outsourced Suppliers' },
                      { key: 'w_previewed_hours', label: 'Previewed Hours' }
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {label}
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="0"
                            max="0.5"
                            step="0.01"
                            value={config[key as keyof Config]}
                            onChange={(e) => handleConfigChange(key as keyof Config, parseFloat(e.target.value))}
                            className="flex-1"
                          />
                          <span className="w-12 text-sm text-gray-900">
                            {Math.round((config[key as keyof Config] as number) * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reference Values */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Reference Values</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lead Time Reference (days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={config.lead_time_ref_days}
                        onChange={(e) => handleConfigChange('lead_time_ref_days', parseInt(e.target.value) || 90)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Previewed Hours Reference
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={config.previewed_hours_ref}
                        onChange={(e) => handleConfigChange('previewed_hours_ref', parseInt(e.target.value) || 100)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pieces Cap
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={config.pieces_cap}
                        onChange={(e) => handleConfigChange('pieces_cap', parseInt(e.target.value) || 50)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={resetConfig}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset to Default</span>
              </button>
              <button
                onClick={() => setShowConfigPanel(false)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};