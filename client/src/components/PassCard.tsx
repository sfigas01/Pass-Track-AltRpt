import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, MapPin, Users, Clock, Plus, Archive, DollarSign } from "lucide-react";
import { type ClassPass } from "@shared/schema";
import { differenceInDays, format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

interface PassCardProps {
  pass: ClassPass;
  onCheckIn?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onExtend?: (id: string) => void;
  onArchive?: (id: string) => void;
}

export function PassCard({ pass, onCheckIn, onViewDetails, onExtend, onArchive }: PassCardProps) {
  const isUsageBased = pass.trackingType === 'usage_based';
  const usagePercentage = isUsageBased ? 0 : ((pass.totalClasses! - pass.remainingClasses!) / pass.totalClasses!) * 100;
  const daysUntilExpiry = pass.expirationDate ? differenceInDays(new Date(pass.expirationDate), new Date()) : null;
  
  // Fetch usage analytics for usage-based passes
  const { data: analytics } = useQuery<{ totalUnits: number; totalCost: number; sessionCount: number }>({
    queryKey: ['/api/class-passes', pass.id, 'analytics'],
    enabled: isUsageBased,
  });
  
  const getStatusColor = () => {
    if (isUsageBased) return "default"; // Usage-based passes are always active
    if (!pass.expirationDate) return "default";
    if (daysUntilExpiry! < 0) return "destructive";
    if (daysUntilExpiry! <= 7) return "secondary"; // Warning color
    return "default";
  };

  const getStatusText = () => {
    if (isUsageBased) return "Pay per use";
    if (!pass.expirationDate) return "No expiration";
    if (daysUntilExpiry! < 0) return "Expired";
    if (daysUntilExpiry! <= 7) return `${daysUntilExpiry} days left`;
    return `${daysUntilExpiry} days left`;
  };

  return (
    <Card className="p-4 hover-elevate" data-testid={`card-pass-${pass.id}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-base" data-testid={`text-studio-${pass.id}`}>
              {pass.studioName}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              {isUsageBased 
                ? `$${((pass.costPerUnit || 0) / 100).toFixed(2)} per ${pass.unitType}`
                : `${pass.totalClasses} classes`
              }
            </p>
            {!isUsageBased && (
              <p className="text-sm font-medium text-primary mt-1">
                ${(pass.cost / 100).toFixed(2)}
              </p>
            )}
            {isUsageBased && pass.membershipFee && pass.membershipFee > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Membership: ${(pass.membershipFee / 100).toFixed(2)}/{pass.membershipPeriod}
              </p>
            )}
          </div>
          <Badge variant={getStatusColor()} data-testid={`badge-status-${pass.id}`}>
            {getStatusText()}
          </Badge>
        </div>

        {/* Progress or Usage Info */}
        {isUsageBased ? (
          <div className="space-y-2 p-3 bg-muted/30 rounded-md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Track usage by logging sessions
              </p>
            </div>
            {analytics && analytics.totalCost > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t border-muted">
                <DollarSign className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="text-lg font-semibold" data-testid="text-total-spent">
                    ${(analytics.totalCost / 100).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{analytics.sessionCount} sessions</p>
                  <p className="text-xs text-muted-foreground">{analytics.totalUnits} {pass.unitType}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span data-testid={`text-remaining-${pass.id}`}>
                {pass.remainingClasses} classes left
              </span>
              <span className="text-muted-foreground">
                {pass.totalClasses! - pass.remainingClasses!}/{pass.totalClasses} used
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>
        )}

        {/* Details */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>
              {pass.expirationDate 
                ? `Expires ${format(new Date(pass.expirationDate), 'MMM d, yyyy')}`
                : 'Never expires'
              }
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {isUsageBased ? (
            <>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onCheckIn?.(pass.id)}
                data-testid={`button-log-session-${pass.id}`}
              >
                <Plus className="w-3 h-3 mr-1" />
                Log Session
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDetails?.(pass.id)}
                data-testid={`button-details-${pass.id}`}
              >
                Details
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onArchive?.(pass.id)}
                data-testid={`button-archive-${pass.id}`}
              >
                <Archive className="w-3 h-3" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                className="flex-1"
                disabled={pass.remainingClasses === 0 || (daysUntilExpiry !== null && daysUntilExpiry < 0)}
                onClick={() => onCheckIn?.(pass.id)}
                data-testid={`button-checkin-${pass.id}`}
              >
                <Clock className="w-3 h-3 mr-1" />
                Check In
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onExtend?.(pass.id)}
                data-testid={`button-extend-${pass.id}`}
              >
                <Plus className="w-3 h-3 mr-1" />
                Extend
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDetails?.(pass.id)}
                data-testid={`button-details-${pass.id}`}
              >
                Details
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onArchive?.(pass.id)}
                data-testid={`button-archive-${pass.id}`}
              >
                <Archive className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}