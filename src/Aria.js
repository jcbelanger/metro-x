function ariaButton({label, disabled=false, onClick}) {
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
    //   'aria-lablel': label,
      'aria-disabled': disabled,
      tabIndex: disabled ? undefined : 0,
      onClick: handleClick,
      onKeyDown: handleKeyPressed
    }
};

export {ariaButton};