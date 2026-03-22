import { SearchInput } from "../common/SearchInput";

type RideSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function RideSearchBar({ value, onChange }: RideSearchBarProps) {
  return <SearchInput value={value} onChange={onChange} placeholder="Filter ride or driver name" />;
}
