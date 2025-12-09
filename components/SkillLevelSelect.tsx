import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type SkillLevel } from "@/lib/types/trip";

interface SkillLevelSelectProps {
  value: SkillLevel;
  onChange: (value: SkillLevel) => void;
}

export function SkillLevelSelect({ value, onChange }: SkillLevelSelectProps) {
  return (
    <Select value={value} onValueChange={(val) => onChange(val as SkillLevel)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select skill level" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="beginner">Beginner</SelectItem>
        <SelectItem value="intermediate">Intermediate</SelectItem>
        <SelectItem value="advanced">Advanced</SelectItem>
        <SelectItem value="expert">Expert</SelectItem>
      </SelectContent>
    </Select>
  );
}
