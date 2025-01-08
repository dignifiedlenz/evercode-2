
import Noteopener from "../_components/Noteopener";
import Sidebar from "../_components/sidebar";
import UserMenu from "../_components/UserMenu";


const GroupLayout = ({
    children
}: {
    children: React.ReactNode
}) => {
    return ( 
        <div className="w-screen h-screen flex flex-row">
        <div className="fixed z-50">
        <Sidebar/>
        </div>

        <div className="fixed z-50">
        <UserMenu
        />
        </div>
        
        
        <div className="fixed bottom-5 right-5 z-50">
        <Noteopener/>
        </div>
        <div className="h-full w-full flex flex-col items-center font-custom2">
            {children}
        </div>
        </div>
     );
}
 
export default GroupLayout;