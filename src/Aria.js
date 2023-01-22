function ariaButton({disabled=false, onClick}) {
    function handleKeyPressed(event) {
        if (['Enter', 'Space'].indexOf(event.code) >= 0) {
            handleClick(event);
        }
    }
    
    function handleClick(event) {
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
};

function ariaCheckbox({checked=false, disabled=false, onClick}) {
    function handleKeyPressed(event) {
        if ('Space' === event.code) {
            handleClick(event);
        }
    }
    
    function handleClick(event) {
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
};



export {
    ariaButton,
    ariaCheckbox
};