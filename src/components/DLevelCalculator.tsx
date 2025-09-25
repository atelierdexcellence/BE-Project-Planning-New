import React, { useState, useMemo } from 'react';
import { Calculator, Search, Settings, AlertTriangle, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
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

  // Filter projects
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate D-Level for a project
  const calculateDLevel = (project: Project): DLevelBreakdown => {
    // Get delivery date
    const deliveryDate = new Date(project.deliveryDate);
    const asOfDateTime = new Date(asOfDate);
    const daysDiff = Math.ceil((deliveryDate.getTime() - asOfDateTime.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate individual scores
    const piecesScore = Math.min(1, Math.log(project.pieces + 1) / Math.log(references.PiecesCap + 1));
    
    const sizeScore = project.size === 'Small' ? 0.2 : 
                     project.size === 'Medium' ? 0.6 : 1.0;
    
    const geometryScore = project.geometry === 'Square' ? 0.3 :
                         project.geometry === 'Mixed' ? 0.6 : 1.0;
    
    const urgencyScore = Math.max(0, Math.min(1, (references.LeadTimeRefDays - daysDiff) / references.LeadTimeRefDays));
    
    const costScore = project.targetCostConstraint === 'High' ? 0.2 :
                     project.targetCostConstraint === 'Moderate' ? 0.6 : 1.0;
    
    const modellingScore = project.modelling === '2D' ? 0.3 : 1.0;
    
    const outsourcingScore = Math.min(1, project.outsourcedSuppliers / 5);
    
    const previewedHoursScore = Math.min(1, project.previewedHours / references.PreviewedHoursRef);

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

  // Handle field updates
  const handleFieldUpdate = (projectId: string, field: string, value: any) => {
    const updates = { [field]: value };
    
    // If updating a field that affects D-Level calculation, recalculate
    if (['pieces', 'size', 'geometry', 'targetCostConstraint', 'modelling', 'outsourcedSuppliers'].includes(field)) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        const updatedProject = { ...project, [field]: value };
        const breakdown = calculateDLevel(updatedProject);
        updates.dLevel = breakdown.finalDLevel;
      }
    }
    
    updateProject(projectId, updates);
  };

  const handleDLevelOverride = (projectId: string, override: number | null) => {
    updateProject(projectId, { dLevelOverride: override });
  };

  const handleRecalculateAll = () => {
    filteredProjects.forEach(project => {
      if (!project.dLevelOverride) {
        const breakdown = calculateDLevel(project);
        updateProject(project.id, { dLevel: breakdown.finalDLevel });
      }
    });
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Calculator className="h-10 w-10 mr-4 text-blue-600" />
            D-Level Calculator
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Calculate and manage project difficulty levels (D-Level 1-10)
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowWeightsPanel(!showWeightsPanel)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors border"
          >
            <Settings className="h-5 w-5" />
            <span>{showWeightsPanel ? 'Hide' : 'Show'} Weights</span>
          </button>
          
          <button
            onClick={handleRecalculateAll}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Calculator className="h-5 w-5" />
            <span>Recalculate All</span>
          </button>
        </div>
      </div>

      {/* Top Filters */}
      <div className="flex items-center space-x-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            As-of Date
          </label>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="flex-1 max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Projects
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by project name or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>
      </div>

      <div className="flex space-x-8">
        {/* Left Panel: Weights & References */}
        {showWeightsPanel && (
          <div className="w-80 bg-white rounded-lg shadow-sm border p-6 flex-shrink-0 h-fit">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Settings className="h-6 w-6 mr-3" />
              Weights & References
            </h3>

            {/* Weights validation banner */}
            {!weightsValid && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                  <span className="text-sm text-yellow-800">
                    Weights sum to {totalWeights}% (should be 100%)
                  </span>
                </div>
              </div>
            )}

            {/* Weights */}
            <div className="space-y-4 mb-8">
              <h4 className="text-lg font-medium text-gray-900">Weights (%)</h4>
              {Object.entries(weights).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 flex-1">
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
                    className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-sm text-gray-900">Total:</span>
                  <span className={`text-sm font-bold ${weightsValid ? 'text-green-600' : 'text-red-600'}`}>
                    {totalWeights}%
                  </span>
                </div>
              </div>
            </div>

            {/* References */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">References</h4>
              {Object.entries(references).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 flex-1">
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
                    className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Table */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              Projects — D-Level Analysis ({filteredProjects.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start in BE
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Left
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BE Hours
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pieces
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Geometry
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modelling
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suppliers
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    D-Level
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Override
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project) => {
                  const breakdown = calculateDLevel(project);
                  const daysLeft = getDaysUntilDelivery(project.deliveryDate);
                  const finalDLevel = project.dLevelOverride || breakdown.finalDLevel;
                  const isExpanded = expandedBreakdowns.has(project.id);

                  return (
                    <React.Fragment key={project.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={() => toggleBreakdown(project.id)}
                              className="mr-3 p-1 text-gray-400 hover:text-gray-600"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-5 w-5" />
                              ) : (
                                <ChevronRight className="h-5 w-5" />
                              )}
                            </button>
                            <div>
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {project.name}
                                <ExternalLink className="h-4 w-4 ml-2 text-gray-400" />
                              </div>
                              <div className="text-sm text-gray-500">{project.client}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(project.startInBE)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(project.deliveryDate)}
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
                          {project.previewedHours}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="1"
                            value={project.pieces}
                            onChange={(e) => handleFieldUpdate(project.id, 'pieces', parseInt(e.target.value) || 1)}
                            className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={project.size}
                            onChange={(e) => handleFieldUpdate(project.id, 'size', e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold ${
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
                              className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {project.dLevelOverride && (
                              <button
                                onClick={() => handleDLevelOverride(project.id, null)}
                                className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded"
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
                          <td colSpan={13} className="px-6 py-6">
                            <div className="space-y-4">
                              <h5 className="text-lg font-medium text-gray-900">D-Level Breakdown</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                                <div className="bg-white p-3 rounded-lg border">
                                  <span className="text-gray-600 block">Pieces Score:</span>
                                  <span className="text-lg font-bold text-gray-900">{breakdown.piecesScore.toFixed(3)}</span>
                                </div>
                                <div className="bg-white p-3 rounded-lg border">
                                  <span className="text-gray-600 block">Size Score:</span>
                                  <span className="text-lg font-bold text-gray-900">{breakdown.sizeScore.toFixed(3)}</span>
                                </div>
                                <div className="bg-white p-3 rounded-lg border">
                                  <span className="text-gray-600 block">Geometry Score:</span>
                                  <span className="text-lg font-bold text-gray-900">{breakdown.geometryScore.toFixed(3)}</span>
                                </div>
                                <div className="bg-white p-3 rounded-lg border">
                                  <span className="text-gray-600 block">Urgency Score:</span>
                                  <span className="text-lg font-bold text-gray-900">{breakdown.urgencyScore.toFixed(3)}</span>
                                </div>
                                <div className="bg-white p-3 rounded-lg border">
                                  <span className="text-gray-600 block">Cost Score:</span>
                                  <span className="text-lg font-bold text-gray-900">{breakdown.costScore.toFixed(3)}</span>
                                </div>
                                <div className="bg-white p-3 rounded-lg border">
                                  <span className="text-gray-600 block">Modelling Score:</span>
                                  <span className="text-lg font-bold text-gray-900">{breakdown.modellingScore.toFixed(3)}</span>
                                </div>
                                <div className="bg-white p-3 rounded-lg border">
                                  <span className="text-gray-600 block">Outsourcing Score:</span>
                                  <span className="text-lg font-bold text-gray-900">{breakdown.outsourcingScore.toFixed(3)}</span>
                                </div>
                                <div className="bg-white p-3 rounded-lg border">
                                  <span className="text-gray-600 block">Hours Score:</span>
                                  <span className="text-lg font-bold text-gray-900">{breakdown.previewedHoursScore.toFixed(3)}</span>
                                </div>
                              </div>
                              <div className="pt-4 border-t border-gray-200 bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Weighted Sum:</span>
                                  <span className="text-lg font-bold text-blue-600">{breakdown.weightedSum.toFixed(3)}</span>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-lg font-bold text-gray-900">Final D-Level:</span>
                                  <span className="text-2xl font-bold text-blue-600">{breakdown.finalDLevel}</span>
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
            <div className="text-center py-16 text-gray-500">
              <Calculator className="h-16 w-16 mx-auto mb-6 text-gray-300" />
              <p className="text-lg">No projects found</p>
              <p className="text-sm mt-2">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">D-Level Scale</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center font-bold">
              1-2
            </div>
            <span className="text-sm text-gray-700">Very Simple</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold">
              3-4
            </div>
            <span className="text-sm text-gray-700">Simple</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center font-bold">
              5-6
            </div>
            <span className="text-sm text-gray-700">Moderate</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-100 text-orange-800 rounded-full flex items-center justify-center font-bold">
              7-8
            </div>
            <span className="text-sm text-gray-700">Complex</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 text-red-800 rounded-full flex items-center justify-center font-bold">
              9-10
            </div>
            <span className="text-sm text-gray-700">Very Complex</span>
          </div>
        </div>
      </div>
    </div>
  );
};