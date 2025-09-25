import React from 'react';
import { Users, Mail, User } from 'lucide-react';
import { TEAM_MEMBERS } from '../types';
import { useLanguage } from '../hooks/useLanguage';

export const TeamView: React.FC = () => {
  const { t } = useLanguage();

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      team_member: 'bg-blue-100 text-blue-800',
      commercial: 'bg-green-100 text-green-800',
      atelier: 'bg-purple-100 text-purple-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const teamMemberPhotos = {
    'as': 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    'mr': 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    'aq': 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    'sr': 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    'ld': 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    'ps': 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    'nr': 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    'virginie': 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    'admin': 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="h-8 w-8 mr-3 text-blue-600" />
            {t('nav.team')}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Team members and their roles • {TEAM_MEMBERS.length} members
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEAM_MEMBERS.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={teamMemberPhotos[member.id as keyof typeof teamMemberPhotos] || "/PHOTO-2023-09-13-11-16-45 copy.jpg"}
                alt={teamMemberPhotos[member.id as keyof typeof teamMemberPhotos] ? member.name : "Atelier d'Excellence"}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const hasCustomPhoto = teamMemberPhotos[member.id as keyof typeof teamMemberPhotos];
                  if (hasCustomPhoto) {
                    target.src = "/PHOTO-2023-09-13-11-16-45 copy.jpg";
                    target.alt = "Atelier d'Excellence";
                  } else {
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }
                }}
              />
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-xl font-medium" style={{ display: 'none' }}>
                {member.initials}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full capitalize ${getRoleColor(member.role)}`}>
                  {member.role.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span className="truncate">{member.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};