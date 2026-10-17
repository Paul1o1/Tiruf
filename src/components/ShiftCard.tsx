import { Shift, Hospital } from '@/types/tiruf';
import { Card, Chip, Button } from '@/components/ui';
import { formatETB } from '@/lib/utils';
import { Calendar, Clock, MapPin } from 'lucide-react';

export function ShiftCard({ shift, hospital, onApply }: { shift: Shift; hospital: Hospital; onApply: () => void }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-semibold text-lg text-ink">{hospital.name}</div>
          <div className="text-muted text-sm flex items-center gap-1">
            <MapPin size={14} /> {hospital.area} · {shift.distanceKm} km
          </div>
        </div>
        {shift.urgency === 'high' && <Chip className="text-[var(--color-urgent)] border-[var(--color-urgent)]/40">Urgent</Chip>}
      </div>
      <div className="flex items-center gap-3 text-sm text-muted mb-2">
        <span className="flex items-center gap-1"><Calendar size={14} /> {shift.date}</span>
        <span className="flex items-center gap-1"><Clock size={14} /> {shift.startTime} - {shift.endTime}</span>
      </div>
      <div className="text-ink font-semibold mb-2">
        {shift.ward} · {shift.specialty}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-primary font-semibold">{formatETB(shift.totalPay)}</div>
          <div className="text-muted text-xs">{formatETB(shift.ratePerHour)}/hr</div>
        </div>
        <Button onClick={onApply} className="h-10 px-6">Apply</Button>
      </div>
    </Card>
  );
}
