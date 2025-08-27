import { Navigate, Outlet } from "react-router-dom";
import { useRecoilValue } from "recoil";
import {
  accessTokenState,
  refreshTokenState,
  userState,
} from "../../utils/atom/authAtom";

export default function AuthLayout() {
  const accessToken = useRecoilValue(accessTokenState);
  const refreshToken = useRecoilValue(refreshTokenState);
  const user = useRecoilValue(userState);

  const auth = {
    access: accessToken,
    token: refreshToken,
  };

  return (
    <div>
      {auth?.access && user?.email !== null && !user?.verify ? (
        <Outlet />
      ) : (
        <Navigate to="/" />
      )}
    </div>
  );
}
