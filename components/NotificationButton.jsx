import Image from "next/image";
import notificationIcon from "../../assets/images/bell.png";
import { useEffect, useState } from "react";

const NotificationButton = ({ onClick, dataNotification, className }) => {
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const count = dataNotification?.filter(
      (data) => data.read === false
    ).length;
    setNotificationCount(count);
  }, [dataNotification]);

  return (
    <div className="relative inline-block cursor-pointer" onClick={onClick}>
      <Image
        src={notificationIcon}
        alt="Notification Icon"
        className={className}
      />
      {notificationCount > 0 && (
        <span className="absolute top-[-5px] right-[-5px] bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {notificationCount}
        </span>
      )}
    </div>
  );
};

export default NotificationButton;
