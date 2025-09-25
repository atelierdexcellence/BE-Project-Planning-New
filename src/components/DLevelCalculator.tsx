import React, { useState, useMemo } from 'react';
import { Calculator, Search, Settings, AlertTriangle, ExternalLink, ChevronDown, ChevronRight, Save, RotateCcw } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import type { Project, DLevelWeights, DLevelReferences, DLevelBreakdown } from '../types';

export const DLevelCalculator: React.FC = () => {
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

  // Calculate total weights
  const totalWeights = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  const weightsValid = totalWeights === 100;

  // Calculate D-Level for a project
  const calculateDLevel = (project: Project): DLevelBreakdown => {
    // Get delivery date
    const deliveryDate = new Date(project.key_dates.previewed_delivery);
    const asOfDateTime = new Date(asOfDate);
    const daysDiff = Math.ceil((deliveryDate.getTime() - asOfDateTime.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate individual scores
    const piecesScore = Math.min(1, Math.log(project.pieces + 1) / Math.log(references.PiecesCap + 1));
    
    const sizeScore = project.size === 'Small' ? 0.2 : 
                     project.size === 'Medium' ? 0.6 : 1.0;
    
    const geometryScore = project.geometry === 'Square' ? 0.3 :
                         project.geometry === 'Mixed' ? 0.6 : 1.0;
    
    const urgencyScore = Math.max(0, Math.min(1, (references.LeadTimeRefDays - daysDiff) / references.LeadTimeRefDays));
    
    const costScore = project.target_cost_constraint === 'High' ? 0.2 :
                     project.target_cost_constraint === 'Moderate' ? 0.6 : 1.0;
    
    const modellingScore = project.modelling === '2D' ? 0.3 : 1.0;
    
    const outsourcingScore = Math.min(1, project.outsourced_suppliers / 5);
    
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
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle field updates
  const handleFieldUpdate = async (projectId: string, field: string, value: any) => {
    const updates = { [field]: value };
    
    // If updating a field that affects D-Level calculation, recalculate
    if (['pieces', 'size', 'geometry', 'target_cost_constraint', 'modelling', 'outsourced_suppliers'].includes(field)) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        const updatedProject = { ...project, [field]: value };
        const breakdown = calculateDLevel(updatedProject);
        updates.d_level = breakdown.finalDLevel;
      }
    }
    
    await updateProject(projectId, updates);
  };

  const handleDLevelOverride = async (projectId: string, override: number | null) => {
    await updateProject(projectId, { d_level_override: override });
  };

  const handleRecalculateAll = async () => {
    for (const project of filteredProjects) {
      if (!project.d_level_override) {
        const breakdown = calculateDLevel(project);
        await updateProject(project.id, { d_level: breakdown.finalDLevel });
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

  const resetWeights = () => {
    setWeights({
      W_Geometry: 22,
      W_Pieces: 15,
      W_Size: 10,
      W_Urgency: 15,
      W_Cost: 10,
      W_Modelling: 8,
      W_Outsourcing: 10,
      W_PreviewedHours: 10
    });
  };

  const resetReferences = () => {
    setReferences({
      LeadTimeRefDays: 60,
      PreviewedHoursRef: 80,
      PiecesCap: 10
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Calculator className="h-10 w-10 mr-4 text-blue-600" />
              D-Level Calculator
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Calculate and manage project difficulty levels (D-Level 1-10)
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowWeightsPanel(!showWeightsPanel)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Settings className="h-4 w-4" />
              <span>{showWeightsPanel ? 'Hide' : 'Show'} Configuration</span>
            </button>
            
            <button
              onClick={handleRecalculateAll}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Calculator className="h-4 w-4" />
              <span>Recalculate All</span>
            </button>
          </div>
        </div>

        {/* Top Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-6">
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
                  placeholder="Search by project name or client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Projects Found</div>
              <div className="text-2xl font-bold text-blue-600">{filteredProjects.length}</div>
            </div>
          </div>
        </div>

        <div className="flex space-x-6">
          {/* Left Panel: Weights & References */}
          {showWeightsPanel && (
            <div className="w-80 bg-white rounded-lg shadow-sm border p-6 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Configuration
                </h3>
                <button
                  onClick={() => {
                    resetWeights();
                    resetReferences();
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Reset to defaults"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

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

              {/* Algorithm Info */}
              <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="text-sm font-medium text-blue-900 mb-2">Algorithm Info</h5>
                <div className="text-xs text-blue-800 space-y-1">
                  <p>• Scores normalized to 0-1 scale</p>
                  <p>• Weighted sum applied</p>
                  <p>• Final D-Level: 1-10 scale</p>
                  <p>• Override takes precedence</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Table */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Projects — D-Level Analysis ({filteredProjects.length})
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
                    const finalDLevel = project.d_level_override || breakdown.finalDLevel;
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
                              value={project.target_cost_constraint}
                              onChange={(e) => handleFieldUpdate(project.id, 'target_cost_constraint', e.target.value)}
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
                              value={project.outsourced_suppliers}
                              onChange={(e) => handleFieldUpdate(project.id, 'outsourced_suppliers', parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                                finalDLevel >= 8 ? 'bg-red-100 text-red-800 border-2 border-red-300' :
                                finalDLevel >= 6 ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300' :
                                finalDLevel >= 4 ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' :
                                'bg-green-100 text-green-800 border-2 border-green-300'
                              }`}>
                                {finalDLevel}
                              </span>
                              {project.d_level_override && (
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
                                value={project.d_level_override || ''}
                                onChange={(e) => handleDLevelOverride(project.id, e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="Auto"
                                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              {project.d_level_override && (
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

        {/* Legend */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">D-Level Scale</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center font-bold text-sm border-2 border-green-300">
                1-3
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Simple</div>
                <div className="text-xs text-gray-500">Basic projects</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-sm border-2 border-blue-300">
                4-5
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Moderate</div>
                <div className="text-xs text-gray-500">Standard complexity</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center font-bold text-sm border-2 border-yellow-300">
                6-7
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Complex</div>
                <div className="text-xs text-gray-500">Challenging projects</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 text-red-800 rounded-full flex items-center justify-center font-bold text-sm border-2 border-red-300">
                8-9
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Very Complex</div>
                <div className="text-xs text-gray-500">High difficulty</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-200 text-red-900 rounded-full flex items-center justify-center font-bold text-sm border-2 border-red-400">
                10
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Extreme</div>
                <div className="text-xs text-gray-500">Maximum complexity</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};