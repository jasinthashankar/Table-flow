import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  message = '',
  action,
}) => (
  <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
    <div className="tf-empty-icon relative mb-5 grid h-16 w-16 place-items-center rounded-2xl">
      <Icon size={25} strokeWidth={1.7} />
      <span className="tf-empty-dot absolute -right-1 -top-1 h-3 w-3 rounded-full" />
    </div>

    <h3 className="mb-1 text-base font-semibold tracking-[-.02em] text-white">
      {title}
    </h3>

    {message && (
      <p className="max-w-sm text-xs leading-6 text-[#8f9bad]">
        {message}
      </p>
    )}

    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
