import React, { useState, useEffect } from 'react';
import { X, GripVertical, Plus, Minus } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import type { Task, TaskCategory } from '../../types';
import { TASK_CATEGORIES } from '../../types';

interface TaskManagerProps {
  projectId: string;
  tasks: Task[];
  onSave: (tasks: Task[]) => void;
  onCancel: () => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ 
  projectId, 
  tasks, 
  onSave, 
  onCancel 
}) => {
  const { t } = useLanguage();
  const [enabledTasks, setEnabledTasks] = useState<Task[]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  useEffect(() => {
    // Initialize with existing tasks or create default structure
    if (tasks.length > 0) {
      setEnabledTasks(tasks.filter(task => task.enabled).sort((a, b) => a.order_index - b.order_index));
    } else {
      // Create default enabled tasks for new projects (first 11 standard tasks)
      const defaultTasks = TASK_CATEGORIES.slice(0, 11).map((category, index) => ({
        id: `${projectId}-${category.id}`,
        project_id: projectId,
        name: t(`task.${category.id}`),
        category: category.id,
        phase: category.phase,
        duration_days: category.default_duration_days,
        start_date: '',
        end_date: '',
        assignee_id: '',
        status: 'pending' as const,
        progress: 0,
        dependencies: [],
        order_index: index,
        enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      setEnabledTasks(defaultTasks);
    }
  }, [tasks, projectId, t]);

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedItem === null) return;

    const newTasks = [...enabledTasks];
    const draggedTask = newTasks[draggedItem];
    newTasks.splice(draggedItem, 1);
    newTasks.splice(dropIndex, 0, draggedTask);

    // Update order
    const reorderedTasks = newTasks.map((task, index) => ({
      ...task,
      order_index: index
    }));

    setEnabledTasks(reorderedTasks);
    setDraggedItem(null);
  };

  const handleAddTask = (category: TaskCategory) => {
    const categoryInfo = TASK_CATEGORIES.find(c => c.id === category);
    if (!categoryInfo) return;

    const newTask: Task = {
      id: `${projectId}-${category}`,
      project_id: projectId,
      name: t(`task.${category}`),
      category,
      phase: categoryInfo.phase,
      duration_days: categoryInfo.default_duration_days,
      start_date: '',
      end_date: '',
      assignee_id: '',
      status: 'pending',
      progress: 0,
      dependencies: [],
      order_index: enabledTasks.length,
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setEnabledTasks([...enabledTasks, newTask]);
  };

  const handleRemoveTask = (taskId: string) => {
    const updatedTasks = enabledTasks
      .filter(task => task.id !== taskId)
      .map((task, index) => ({ ...task, order_index: index }));
    setEnabledTasks(updatedTasks);
  };

  const handleSave = () => {
    // Combine enabled and disabled tasks
    const allTasks = [
      ...enabledTasks,
      ...tasks.filter(task => !task.enabled)
    ];
    onSave(allTasks);
  };

  const availableCategories = TASK_CATEGORIES.filter(
    category => !enabledTasks.some(task => task.category === category.id)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('tasks.manage')}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-600">{t('tasks.reorder')}</p>

          {/* Enabled Tasks */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('tasks.enabled_tasks')} ({enabledTasks.length})
            </h3>
            <div className="space-y-2">
              {enabledTasks.map((task, index) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-transparent hover:border-blue-300 cursor-move ${
                    draggedItem === index ? 'opacity-50' : ''
                  }`}
                >
                  <GripVertical className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.phase === 'pre_prod' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {task.phase === 'pre_prod' ? 'Pré-Prod' : 'Prod'}
                      </span>
                      <span className="font-medium text-gray-900">{task.name}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveTask(task.id)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Available Tasks */}
          {availableCategories.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('tasks.available_tasks')} ({availableCategories.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          category.phase === 'pre_prod' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {category.phase === 'pre_prod' ? 'Pré-Prod' : 'Prod'}
                        </span>
                        <span className="text-gray-900">{t(`task.${category.id}`)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddTask(category.id)}
                      className="p-1 text-green-500 hover:text-green-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            {t('tasks.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('tasks.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
