import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { TeamMember } from '@/services/userService';

interface TeamTreeNodeProps {
  member: TeamMember;
  isRoot?: boolean;
  onMemberClick?: (member: TeamMember) => void;
}

export const TeamTreeNode = ({ member, isRoot = false, onMemberClick }: TeamTreeNodeProps) => {
  const hasChildren = member.children && member.children.length > 0;
  const initials = member.firstName && member.lastName 
    ? `${member.firstName[0]}${member.lastName[0]}`.toUpperCase()
    : member.name 
    ? member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleClick = () => {
    if (onMemberClick && !isRoot) {
      onMemberClick(member);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Member Node */}
      <div className="relative flex flex-col items-center">
        {/* Circular Node */}
        <div 
          className={`relative flex flex-col items-center justify-center ${!isRoot && onMemberClick && 'cursor-pointer group'}`}
          onClick={handleClick}
        >
          <div className={`relative rounded-full border-4 ${isRoot ? 'border-primary bg-primary/5' : 'border-gray-300 bg-white hover:border-primary/50'} transition-all p-1 shadow-lg`}>
            <Avatar className={isRoot ? 'h-20 w-20' : 'h-16 w-16'}>
              <AvatarImage src={member.profileImage} alt={member.name} />
              <AvatarFallback className={isRoot ? 'bg-primary text-primary-foreground text-xl' : 'bg-gray-200 text-lg'}>
                {initials}
              </AvatarFallback>
            </Avatar>
            {isRoot && (
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-primary">Root</Badge>
              </div>
            )}
          </div>
          
          {/* Member Info Below Circle */}
          <div className="mt-3 text-center max-w-[150px]">
            <p className={`font-semibold truncate ${isRoot ? 'text-base' : 'text-sm'}`}>
              {member.name || `${member.firstName} ${member.lastName}`}
            </p>
            <p className="text-xs text-muted-foreground truncate">{member.email}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Badge 
                variant="outline" 
                className={`text-xs capitalize ${
                  member.status === 'active' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {member.status}
              </Badge>
              {member.teamCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  {member.teamCount} {member.teamCount === 1 ? 'ref' : 'refs'}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Code: <span className="font-semibold">{member.myReferralCode}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Children Container */}
      {hasChildren && (
        <div className="relative mt-12">
          {/* Vertical Line from Parent */}
          <div className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-gray-300 h-12 -top-12"></div>
          
          {/* Horizontal Line connecting children */}
          {member.children.length > 1 && (
            <div 
              className="absolute top-0 h-0.5 bg-gray-300" 
              style={{
                left: `${100 / (member.children.length * 2)}%`,
                right: `${100 / (member.children.length * 2)}%`,
              }}
            ></div>
          )}
          
          {/* Children Nodes */}
          <div className="flex justify-center gap-16">
            {member.children.map((child) => (
              <div key={child._id} className="relative flex flex-col items-center">
                {/* Vertical line to child */}
                <div className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-gray-300 h-12 -top-12"></div>
                
                <TeamTreeNode
                  member={child}
                  isRoot={false}
                  onMemberClick={onMemberClick}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
