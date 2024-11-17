import { ThemeSwitch } from "@litespace/luna/ThemeSwitch";
import Notification from "@litespace/assets/Notification";
import UserOverview from "@/components/Common/UserOverview";
import { SearchInput } from "@litespace/luna/SearchInput";

const Navbar = () => {
  return (
    <nav className="flex justify-between py-8 px-6">
      <div className="flex items-center ">
        <SearchInput />
      </div>
      <div className="flex items-center gap-6 justify-center">
        <Notification />
        <ThemeSwitch />
        <UserOverview />
      </div>
    </nav>
  );
};

export default Navbar;
