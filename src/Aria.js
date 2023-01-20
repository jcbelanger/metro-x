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
      onClick: handleClick,
      onKeyDown: handleKeyPressed,
      tabIndex: disabled ? undefined : 0,
      role: 'button',
      'aria-disabled': disabled
    }
};

export {ariaButton};