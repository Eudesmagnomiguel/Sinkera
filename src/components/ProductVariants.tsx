import { useState, useEffect } from 'react';

export interface Variant {
  label: string;
  available: boolean;
  default?: boolean;
}

export interface VariantGroup {
  name: string;
  variants: Variant[];
}

interface ProductVariantsProps {
  groups: VariantGroup[];
  onSelectionChange: (selection: Record<string, string>) => void;
}

const COLOR_MAP: Record<string, string> = {
  preto: '#111111',
  negro: '#111111',
  black: '#111111',
  branco: '#f5f5f5',
  white: '#f5f5f5',
  azul: '#2563eb',
  blue: '#2563eb',
  vermelho: '#dc2626',
  red: '#dc2626',
  verde: '#16a34a',
  green: '#16a34a',
  amarelo: '#eab308',
  yellow: '#eab308',
  rosa: '#ec4899',
  pink: '#ec4899',
  roxo: '#7c3aed',
  purple: '#7c3aed',
  cinzento: '#6b7280',
  cinza: '#6b7280',
  gray: '#6b7280',
  grey: '#6b7280',
  dourado: '#d97706',
  gold: '#d97706',
  prata: '#9ca3af',
  silver: '#9ca3af',
  laranja: '#ea580c',
  orange: '#ea580c',
  titanium: '#8d9192',
  titânio: '#8d9192',
};

function getColorHex(label: string): string | null {
  const key = label.toLowerCase().trim();
  return COLOR_MAP[key] ?? null;
}

export function ProductVariants({ groups, onSelectionChange }: ProductVariantsProps) {
  const [selection, setSelection] = useState<Record<string, string>>({});

  useEffect(() => {
    const initial: Record<string, string> = {};
    groups.forEach((group) => {
      const preferred = group.variants.find((v) => v.available && v.default);
      const first = group.variants.find((v) => v.available);
      const chosen = preferred ?? first;
      if (chosen) initial[group.name] = chosen.label;
    });
    setSelection(initial);
    onSelectionChange(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  const handleSelect = (groupName: string, label: string) => {
    const next = { ...selection, [groupName]: label };
    setSelection(next);
    onSelectionChange(next);
  };

  if (groups.length === 0) return null;

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const isColorGroup = group.name.toLowerCase().includes('cor');
        return (
          <div key={group.name}>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-sm font-semibold text-foreground">{group.name}</span>
              {selection[group.name] && (
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{selection[group.name]}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {group.variants.map((variant) => {
                const isSelected = selection[group.name] === variant.label;

                if (isColorGroup) {
                  const hex = getColorHex(variant.label);
                  if (hex) {
                    return (
                      <button
                        key={variant.label}
                        onClick={() => variant.available && handleSelect(group.name, variant.label)}
                        disabled={!variant.available}
                        title={variant.label}
                        aria-label={variant.label}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-150 flex-shrink-0 ${
                          !variant.available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                        } ${
                          isSelected
                            ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                            : 'border-border hover:border-primary/60'
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    );
                  }
                }

                // Text pill
                return (
                  <button
                    key={variant.label}
                    onClick={() => variant.available && handleSelect(group.name, variant.label)}
                    disabled={!variant.available}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all duration-150 flex-shrink-0 ${
                      !variant.available
                        ? 'opacity-40 cursor-not-allowed line-through border-border text-muted-foreground'
                        : isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card text-foreground border-border hover:border-primary/60 hover:bg-muted/50 cursor-pointer'
                    }`}
                  >
                    {variant.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
