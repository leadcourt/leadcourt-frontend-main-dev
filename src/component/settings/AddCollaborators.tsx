import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
  

export default function AddCollaborators( ) {

  const navigate = useNavigate()

  return (
    <div className=" ">
      <div className=" ">
        
        
        <div className="">
          <button onClick={()=>navigate('/collaborators')} className="flex items-center gap-3 w-full hover:bg-gray-50 rounded-lg p-2 transition-colors cursor-pointer">
            <div className="bg-gray-100 rounded-lg p-2">
              <Plus size={20} className="text-[#F35114]" />
            </div>
            <span className="text-[#F35114] font-medium">Send an invite to a friend</span>
          </button>

        </div>
      </div>
    </div>
  );
}
 