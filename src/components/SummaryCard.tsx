import React, { ReactNode, FC } from "react";

const SummaryCard: FC<{
  title: string;
  value: number | string;
  icon: ReactNode;
}> = ({ title, value, icon }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
    <div className="px-12 py-12 sm:p-12">
      <div className="flex items-center">
        <div className="flex-shrink-0 rounded-md bg-indigo-50 p-3">{icon}</div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {value}
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

export default SummaryCard;
