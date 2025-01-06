import Sidebar from "../_components/sidebar";


const GroupLayout = ({
    children
}: {
    children: React.ReactNode
}) => {
    return ( 
        <div className="w-screen h-screen flex flex-row">
        <Sidebar/>
        <div className="h-full w-full flex flex-col items-center font-custom2">
            {children}
        </div>
        </div>
     );
}
 
export default GroupLayout;