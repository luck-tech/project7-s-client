import React from "react";

const MaintenancePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <h1 className="text-4xl font-bold mb-4">🚧 メンテナンス中 🚧</h1>
      <p className="text-lg mb-6">
        サイトは現在メンテナンス中です。しばらくお待ちください。
      </p>
    </div>
  );
};

export default MaintenancePage;
