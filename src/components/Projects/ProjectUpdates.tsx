import React, { useState } from 'react';
import { MessageSquare, Send, Clock, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { ProjectNote } from '../../types';

interface ProjectUpdatesProps {
  projectId: string;
  updates: ProjectNote[];
  onAddUpdate: (content: string, authorId: string, authorName: string) => void;
}

export const ProjectUpdates: React.FC<ProjectUpdatesProps> = ({ 
  projectId, 
  updates, 
  onAddUpdate 
}) => {
  const { user } = useAuth();
  const [newUpdate, setNewUpdate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdate.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await onAddUpdate(newUpdate.trim(), user.id, user.name);
      setNewUpdate('');
    } catch (error) {
      console.error('Failed to add update:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedUpdates = [...updates]
    .filter(update => update.type === 'update')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6">
      {/* Add New Update */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <MessageSquare className="h-4 w-4 mr-2" />
          Add Project Update
        </h4>
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={newUpdate}
            onChange={(e) => setNewUpdate(e.target.value)}
            placeholder="Share an update about this project..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Updates will be sent to the Commercial and BE team member via email
            </p>
            <button
              type="submit"
              disabled={!newUpdate.trim() || isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? 'Sending...' : 'Send Update'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Updates History */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Update History ({sortedUpdates.length})
        </h4>
        
        {sortedUpdates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No updates yet</p>
            <p className="text-xs mt-1">Be the first to add a project update</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {sortedUpdates.map((update) => (
              <div key={update.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium flex-shrink-0">
                    {update.author_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {update.author_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(update.created_at)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {update.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};