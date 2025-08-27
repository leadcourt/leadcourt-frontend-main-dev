
const SwitchInputButton = ({text, disabled, action, setAction}:any) => {
  return (
    <div className="flex items-center space-x-3 cursor-pointer py-1 px-2 lg:min-w[180px] w-fit rounded-full"
        onClick={() => setAction(!action)}
    >
      <button
        type="button"
        role="switch"
        aria-checked={action}
        disabled={disabled}
        
        className={` 
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out 
          ${action ? 'bg-orange-500' : 'bg-gray-200'}
        `}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
            transition duration-200 ease-in-out
            ${action ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
        <span className={`text-sm font-medium ${action? 'text-gray-700': 'text-gray-300'}`}>{text}</span>
    </div>
  );
};

export default SwitchInputButton;


 