import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  min?: number;
  max?: number;
  step?: number;
  value?: number[];
  onChange?: (value: number[]) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    { className, min = 0, max = 100, step = 1, value = [0], onChange, ...props },
    ref
  ) => {
    // Support both single and dual-handle sliders
    const isDualHandle = value.length === 2;
    const [localValue, setLocalValue] = React.useState(
      isDualHandle ? value : [value[0]]
    );

    React.useEffect(() => {
      setLocalValue(isDualHandle ? value : [value[0]]);
    }, [value, isDualHandle]);

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMin = Number(e.target.value);
      const newValue = isDualHandle
        ? [Math.min(newMin, localValue[1]), localValue[1]]
        : [newMin];
      setLocalValue(newValue);
      onChange?.(newValue);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMax = Number(e.target.value);
      const newValue = [localValue[0], Math.max(newMax, localValue[0])];
      setLocalValue(newValue);
      onChange?.(newValue);
    };

    if (isDualHandle) {
      return (
        <div className="relative w-full">
          {/* Track */}
          <div className="relative h-2 bg-secondary rounded-lg">
            {/* Active range highlight */}
            <div
              className="absolute h-full bg-primary rounded-lg"
              style={{
                left: `${((localValue[0] - min) / (max - min)) * 100}%`,
                right: `${100 - ((localValue[1] - min) / (max - min)) * 100}%`,
              }}
            />
          </div>

          {/* Min slider */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localValue[0]}
            onChange={handleMinChange}
            className={cn(
              'absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer pointer-events-none',
              '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow',
              '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow',
              className
            )}
            {...props}
          />

          {/* Max slider */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localValue[1]}
            onChange={handleMaxChange}
            className={cn(
              'absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer pointer-events-none',
              '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow',
              '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow',
              className
            )}
            {...props}
          />
        </div>
      );
    }

    // Single handle slider
    return (
      <div className="relative flex items-center w-full">
        <input
          type="range"
          ref={ref}
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={handleMinChange}
          className={cn(
            'w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary',
            '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };
