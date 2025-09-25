import React, { useState, useMemo } from 'react';
import { Calculator, Search, Settings, Save, AlertTriangle, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import type { Project } from '../types';

interface DLevelWeights {
  W_Geometry: number;
  W_Pieces: number;
  W_Size: number;
  W_Urgency: number;
  W_Cost: number;
  W_Modelling: number;
  W_Outsourcing: number;
  W_PreviewedHours: number;
}

interface DLevelReferences {
  LeadTimeRefDays: number;
  PreviewedHoursRef: number;
  PiecesCap: number;
}

interface ProjectDLevelData extends Project {
  pieces?: number;
  size?: 'Small' | 'Medium' | 'Large';
  geometry?: 'Square' | 'Mixed' | 'Curved';
  targetCostConstraint?: 'High' | 'Moderate' | 'Tight';
  modelling?: '2D' | '3D';
  outsourcedSuppliers?: number;
  dLevelOverride?: number;
  dLevel?: number;
}

interface DLevelBreakdown {
  piecesScore: number;
  sizeScore: number;
  geometryScore: number;
  urgencyScore: number;
  costScore: number;
  modellingScore: number;
  outsourcingScore: number;
  previewedHoursScore: number;
  weightedSum: number;
  finalDLevel: number;
}

export const AdminDLevelView: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { projects, updateProject } = useProjects();
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBreakdowns, setExpandedBreakdowns] = useState<Set<string>>(new Set());
  const [showWeightsPanel, setShowWeightsPanel] = useState(true);
  
  // Weights and references (local state)
  const [weights, setWeights] = useState<DLevelWeights>({
    W_Geometry: 22,
    W_Pieces: 15,
    W_Size: 10,
    W_Urgency: 15,
    W_Cost: 10,
    W_Modelling: 8,
    W_Outsourcing: 10,
    W_PreviewedHours: 10
  });
  
  const [references, setReferences] = useState<DLevelReferences>({
    LeadTimeRefDays: 60,
    PreviewedHoursRef: 80,
    PiecesCap: 10
  });

  // Check if user has admin access
  if (user?.role !== 'admin') {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <Calculator className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need administrator privileges to access the D-Level Calculator.</p>
        </div>
      </div>
    );
  }

  // Calculate total weights
  const totalWeights = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  const weightsValid = totalWeights === 100;

  // Convert projects to D-Level data with defaults
  const projectsWithDLevel = useMemo(() => {
    return projects.map(project => ({
      ...project,
      pieces: (project as any).pieces || 1,
      size: (project as any).size || 'Medium',
      geometry: (project as any).geometry || 'Mixed',
      targetCostConstraint: (project as any).targetCostConstraint || 'Moderate',
      modelling: (project as any).modelling || '2D',
      outsourcedSuppliers: (project as any).outsourcedSuppliers || 0,
      dLevelOverride: (project as any).dLevelOverride || null,
      dLevel: (project as any).dLevel || null
    })) as ProjectDLevelData[];
  }, [projects]);

  // Calculate D-Level for a project
  const calculateDLevel = (project: ProjectDLevelData): DLevelBreakdown => {
    // Get delivery date in Europe/Paris timezone
    const deliveryDate = new Date(project.key_dates.previewed_delivery);
    const asOfDateTime = new Date(asOfDate);
    const daysDiff = Math.ceil((deliveryDate.getTime() - asOfDateTime.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate individual scores
    const piecesScore = Math.min(1, Math.log(project.pieces! + 1) / Math.log(references.PiecesCap + 1));
    
    const sizeScore = project.size === 'Small' ? 0.2 : 
                     project.size === 'Medium' ? 0.6 : 1.0;
    
    const geometryScore = project.geometry === 'Square' ? 0.3 :
                         project.geometry === 'Mixed' ? 0.6 : 1.0;
    
    const urgencyScore = Math.max(0, Math.min(1, (references.LeadTimeRefDays - daysDiff) / references.LeadTimeRefDays));
    
    const costScore = project.targetCostConstraint === 'High' ? 0.2 :
                     project.targetCostConstraint === 'Moderate' ? 0.6 : 1.0;
    
    const modellingScore = project.modelling === '2D' ? 0.3 : 1.0;
    
    const outsourcingScore = Math.min(1, project.outsourcedSuppliers! / 5);
    
    const previewedHoursScore = Math.min(1, project.hours_previewed / references.PreviewedHoursRef);

    // Calculate weighted sum
    const weightedSum = (
      piecesScore * weights.W_Pieces +
      sizeScore * weights.W_Size +
      geometryScore * weights.W_Geometry +
      urgencyScore * weights.W_Urgency +
      costScore * weights.W_Cost +
      modellingScore * weights.W_Modelling +
      outsourcingScore * weights.W_Outsourcing +
      previewedHoursScore * weights.W_PreviewedHours
    ) / 100;

    // Final D-Level (1-10 scale)
    const finalDLevel = Math.round(Math.max(1, Math.min(10, weightedSum * 10)));

    return {
      piecesScore,
      sizeScore,
      geometryScore,
      urgencyScore,
      costScore,
      modellingScore,
      outsourcingScore,
      previewedHoursScore,
      weightedSum,
      finalDLevel
    };
  };

  // Filter projects
  const filteredProjects = projectsWithDLevel.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle field updates
  const handleFieldUpdate = async (projectId: string, field: string, value: any) => {
    const updates = { [field]: value };
    
    // If updating a field that affects D-Level calculation, recalculate
    if (['pieces', 'size', 'geometry', 'targetCostConstraint', 'modelling', 'outsourcedSuppliers'].includes(field)) {
      const project = projectsWithDLevel.find(p => p.id === projectId);
      if (project) {
        const updatedProject = { ...project, [field]: value };
        const breakdown = calculateDLevel(updatedProject);
        updates.dLevel = breakdown.finalDLevel;
      }
    }
    
    await updateProject(projectId, updates);
  };

  const handleDLevelOverride = async (projectId: string, override: number | null) => {
    await updateProject(projectId, { dLevelOverride: override });
  };

  const handleRecalculateAll = async () => {
    for (const project of filteredProjects) {
      if (!project.dLevelOverride) {
        const breakdown = calculateDLevel(project);
        await updateProject(project.id, { dLevel: breakdown.finalDLevel });
      }
    }
  };

  const toggleBreakdown = (projectId: string) => {
    setExpandedBreakdowns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getDaysUntilDelivery = (deliveryDate: string) => {
    const delivery = new Date(deliveryDate);
    const asOf = new Date(asOfDate);
    return Math.ceil((delivery.getTime() - asOf.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calculator className="h-8 w-8 mr-3 text-blue-600" />
            Admin — D-Level Calculator
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Calculate and manage project difficulty levels (D-Level 1-10)
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowWeightsPanel(!showWeightsPanel)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>{showWeightsPanel ? 'Hide' : 'Show'} Weights</span>
          </button>
          
          <button
            onClick={handleRecalculateAll}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Calculator className="h-4 w-4" />
            <span>Recalculate All</span>
          </button>
        </div>
      </div>

      {/* Top Filters */}
      <div className="flex items-center space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            As-of Date
          </label>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Projects
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by project name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex space-x-6">
        {/* Left Panel: Weights & References */}
        {showWeightsPanel && (
          <div className="w-80 bg-white rounded-lg shadow-sm border p-6 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Weights & References
            </h3>

            {/* Weights validation banner */}
            {!weightsValid && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800">
                    Weights sum to {totalWeights}% (should be 100%)
                  </span>
                </div>
              </div>
            )}

            {/* Weights */}
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-medium text-gray-900">Weights (%)</h4>
              {Object.entries(weights).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">
                    {key.replace('W_', '').replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => setWeights(prev => ({
                      ...prev,
                      [key]: parseInt(e.target.value) || 0
                    }))}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-sm text-gray-900">Total:</span>
                  <span className={`text-sm ${weightsValid ? 'text-green-600' : 'text-red-600'}`}>
                    {totalWeights}%
                  </span>
                </div>
              </div>
            </div>

            {/* References */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">References</h4>
              {Object.entries(references).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={value}
                    onChange={(e) => setReferences(prev => ({
                      ...prev,
                      [key]: parseInt(e.target.value) || 1
                    }))}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Table */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Projects — D-Level ({filteredProjects.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start in BE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Left
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BE Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pieces
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Geometry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modelling
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suppliers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    D-Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Override
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project) => {
                  const breakdown = calculateDLevel(project);
                  const daysLeft = getDaysUntilDelivery(project.key_dates.previewed_delivery);
                  const finalDLevel = project.dLevelOverride || breakdown.finalDLevel;
                  const isExpanded = expandedBreakdowns.has(project.id);

                  return (
                    <React.Fragment key={project.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={() => toggleBreakdown(project.id)}
                              className="mr-2 p-1 text-gray-400 hover:text-gray-600"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                            <div>
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {project.name}
                                <ExternalLink className="h-3 w-3 ml-1 text-gray-400" />
                              </div>
                              <div className="text-sm text-gray-500">{project.client}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(project.key_dates.start_in_be)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(project.key_dates.previewed_delivery)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            daysLeft < 0 ? 'text-red-600' :
                            daysLeft < 30 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {daysLeft < 0 ? `${Math.abs(daysLeft)} overdue` : `${daysLeft} days`}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {project.hours_previewed}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="1"
                            value={project.pieces}
                            onChange={(e) => handleFieldUpdate(project.id, 'pieces', parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={project.size}
                            onChange={(e) => handleFieldUpdate(project.id, 'size', e.target.value)}
                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="Small">Small</option>
                            <option value="Medium">Medium</option>
                            <option value="Large">Large</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={project.geometry}
                            onChange={(e) => handleFieldUpdate(project.id, 'geometry', e.target.value)}
                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="Square">Square</option>
                            <option value="Mixed">Mixed</option>
                            <option value="Curved">Curved</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={project.targetCostConstraint}
                            onChange={(e) => handleFieldUpdate(project.id, 'targetCostConstraint', e.target.value)}
                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="High">High</option>
                            <option value="Moderate">Moderate</option>
                            <option value="Tight">Tight</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={project.modelling}
                            onChange={(e) => handleFieldUpdate(project.id, 'modelling', e.target.value)}
                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="2D">2D</option>
                            <option value="3D">3D</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            value={project.outsourcedSuppliers}
                            onChange={(e) => handleFieldUpdate(project.id, 'outsourcedSuppliers', parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                              finalDLevel >= 8 ? 'bg-red-100 text-red-800' :
                              finalDLevel >= 6 ? 'bg-yellow-100 text-yellow-800' :
                              finalDLevel >= 4 ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {finalDLevel}
                            </span>
                            {project.dLevelOverride && (
                              <span className="text-xs text-purple-600 font-medium">Override</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={project.dLevelOverride || ''}
                              onChange={(e) => handleDLevelOverride(project.id, e.target.value ? parseInt(e.target.value) : null)}
                              placeholder="Auto"
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            {project.dLevelOverride && (
                              <button
                                onClick={() => handleDLevelOverride(project.id, null)}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Breakdown Row */}
                      {isExpanded && (
                        <tr className="bg-gray-50">
                          <td colSpan={13} className="px-6 py-4">
                            <div className="space-y-3">
                              <h5 className="text-sm font-medium text-gray-900">D-Level Breakdown</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Pieces Score:</span>
                                  <span className="ml-2 font-medium">{breakdown.piecesScore.toFixed(3)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Size Score:</span>
                                  <span className="ml-2 font-medium">{breakdown.sizeScore.toFixed(3)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Geometry Score:</span>
                                  <span className="ml-2 font-medium">{breakdown.geometryScore.toFixed(3)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Urgency Score:</span>
                                  <span className="ml-2 font-medium">{breakdown.urgencyScore.toFixed(3)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Cost Score:</span>
                                  <span className="ml-2 font-medium">{breakdown.costScore.toFixed(3)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Modelling Score:</span>
                                  <span className="ml-2 font-medium">{breakdown.modellingScore.toFixed(3)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Outsourcing Score:</span>
                                  <span className="ml-2 font-medium">{breakdown.outsourcingScore.toFixed(3)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Hours Score:</span>
                                  <span className="ml-2 font-medium">{breakdown.previewedHoursScore.toFixed(3)}</span>
                                </div>
                              </div>
                              <div className="pt-2 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Weighted Sum:</span>
                                  <span className="text-sm font-medium">{breakdown.weightedSum.toFixed(3)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-900">Final D-Level:</span>
                                  <span className="text-sm font-bold text-blue-600">{breakdown.finalDLevel}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No projects found</p>
              <p className="text-sm mt-1">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};