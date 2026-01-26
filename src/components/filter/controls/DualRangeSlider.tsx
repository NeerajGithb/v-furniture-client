import { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { DualRangeSliderRef } from '../types';

interface Props {
    min: number;
    max: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
    step?: number;
}

export const DualRangeSlider = forwardRef<DualRangeSliderRef, Props>(
    ({ min, max, value, onChange, step = 1 }, ref) => {
        const [localValue, setLocalValue] = useState<[number, number]>(value);
        const [isDragging, setIsDragging] = useState(false);

        useImperativeHandle(ref, () => ({
            resetToDefault: () => {
                setLocalValue([min, max]);
                onChange([min, max]);
            },
        }));

        const applyChanges = useCallback(() => {
            onChange(localValue);
            setIsDragging(false);
        }, [localValue, onChange]);

        const handleMinChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const newMin = Math.max(min, Math.min(Number(e.target.value), localValue[1] - step));
                setLocalValue([newMin, localValue[1]]);
            },
            [min, localValue, step]
        );

        const handleMaxChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const newMax = Math.max(localValue[0] + step, Math.min(Number(e.target.value), max));
                setLocalValue([localValue[0], newMax]);
            },
            [max, localValue, step]
        );

        const handleMouseDown = () => setIsDragging(true);
        const handleMouseUp = () => isDragging && applyChanges();
        const handleTouchStart = () => setIsDragging(true);
        const handleTouchEnd = () => isDragging && applyChanges();

        const getPercentage = useCallback(
            (val: number) => (max === min ? 0 : ((val - min) / (max - min)) * 100),
            [min, max]
        );

        const formatPrice = (price: number) => price.toLocaleString('en-IN');

        return (
            <div className="space-y-4">
                <div className="relative h-6 flex items-center">
                    <div className="absolute w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div
                        className="absolute h-1 bg-lime-500 dark:bg-lime-400 rounded-full transition-all duration-75 ease-out"
                        style={{
                            left: `${getPercentage(localValue[0])}%`,
                            width: `${getPercentage(localValue[1]) - getPercentage(localValue[0])}%`,
                        }}
                    />
                    {[localValue[0], localValue[1]].map((val, idx) => (
                        <input
                            key={idx}
                            type="range"
                            min={min}
                            max={max}
                            value={val}
                            step={step}
                            onChange={idx === 0 ? handleMinChange : handleMaxChange}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                            className="absolute w-full h-1 bg-transparent appearance-none pointer-events-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                             [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-lime-500 dark:[&::-webkit-slider-thumb]:border-lime-400
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-grab 
                            [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:shadow-lg [&::-webkit-slider-thumb]:active:cursor-grabbing"
                        />
                    ))}
                </div>
                <div className="flex justify-between items-center text-sm">
                    <div className="flex flex-col items-start">
                        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Min. Price</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">₹ {formatPrice(localValue[0])}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Max. Price</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">₹ {formatPrice(localValue[1])}</span>
                    </div>
                </div>
            </div>
        );
    }
);

DualRangeSlider.displayName = 'DualRangeSlider';