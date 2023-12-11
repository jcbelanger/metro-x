import React from 'react';


export type AriaButtonProps<T> = {
    disabled?: boolean,
    onClick?: (event:React.MouseEvent<T> | React.KeyboardEvent<T>) => void
};

export function ariaButton<T>({disabled=false, onClick}:AriaButtonProps<T>) {
    function handleKeyPressed(event:React.KeyboardEvent<T>) {
        if (disabled) {
            return;
        }
        if (['Enter', 'Space'].indexOf(event.code) >= 0) {
            onClick?.(event);
        }
    }
    
    function handleClick(event:React.MouseEvent<T>) {
        if (disabled) {
            return;
        }
        onClick?.(event);
    }

    return {
      role: 'button',
      'aria-disabled': disabled,
      tabIndex: disabled ? undefined : 0,
      onClick: handleClick,
      onKeyDown: handleKeyPressed
    }
}

export type AriaCheckboxProps<T> = {
    checked?: boolean | 'mixed',
    disabled?: boolean,
    onClick?: (event:React.MouseEvent<T> | React.KeyboardEvent<T>) => void
};

export function ariaCheckbox<T>({checked=false, disabled=false, onClick}:AriaCheckboxProps<T>) {
    function handleKeyPressed(event:React.KeyboardEvent<T>) {
        if (disabled) {
            return;
        }
        if ('Space' === event.code) {
            onClick?.(event);
        }
    }
    
    function handleClick(event:React.MouseEvent<T>) {
        if (disabled) {
            return;
        }
        onClick?.(event);
    }

    return {
      role: 'checkbox',
      'aria-checked': checked,
      'aria-disabled': disabled,
      tabIndex: disabled ? undefined : 0,
      onClick: handleClick,
      onKeyDown: handleKeyPressed
    }
}