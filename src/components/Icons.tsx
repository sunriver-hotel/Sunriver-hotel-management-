import React, { useContext } from 'react';
import { AppContext } from '../App';

const createIcon = (path: React.ReactNode) => {
  const IconComponent: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {path}
    </svg>
  );
  return IconComponent;
};

export const HomeIcon = createIcon(<>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
</>);
export const BedIcon = createIcon(<>
    <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/>
    <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/>
    <path d="M12 4v6"/>
    <path d="M2 18h20"/>
</>);
export const ChartIcon = createIcon(<>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
</>);
export const CleaningIcon = createIcon(<>
    <path d="M12 3V2"/>
    <path d="M12 21v-8"/>
    <path d="M5 3v2"/>
    <path d="M19 3v2"/>
    <path d="M2 13h20"/>
    <path d="M17 13v-2a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2"/>
</>);
export const ReceiptIcon = createIcon(<>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
</>);
export const SunIcon = createIcon(<>
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
</>);
export const MoonIcon = createIcon(<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>);
export const ChevronLeftIcon = createIcon(<polyline points="15 18 9 12 15 6"/>);
export const ChevronRightIcon = createIcon(<polyline points="9 18 15 12 9 6"/>);
export const LogoutIcon = createIcon(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></>);
export const LogInIcon = createIcon(<><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></>);
export const UploadIcon = createIcon(<>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
</>);
export const TrashIcon = createIcon(<>
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
</>);
export const Spinner = createIcon(<path d="M21 12a9 9 0 1 1-6.219-8.56" />);

export const Logo = ({ className }: { className?: string }) => {
  const { logoUrl } = useContext(AppContext);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-10 h-10 bg-[#e6c872] rounded-full flex items-center justify-center overflow-hidden shrink-0">
        {logoUrl ? (
          <img src={logoUrl} alt="Hotel Logo" className="w-full h-full object-cover" />
        ) : (
          <svg width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(50,50) scale(0.9)">
              <path d="M 0,-45 A 45,45 0 0 1 0,45 A 45,45 0 0 1 0,-45" fill="#e6c872" transform="translate(0, 5)"/>
              <path d="M -5,-15 Q 10,-35 40,0 L 45,-15 Q 10,-55 -5,-25 Z" fill="#0F2C4A"/>
              <path d="M -25,10 Q -5,-10 20,25 L 25,10 Q -5,5 -25,0 Z" fill="#0F2C4A"/>
              <path d="M-50 5 H50" stroke="#0F2C4A" strokeWidth="4" strokeLinecap="round"/>
              <path d="M-50 15 H50" stroke="#0F2C4A" strokeWidth="4" strokeLinecap="round"/>
              <path d="M-50 25 H50" stroke="#0F2C4A" strokeWidth="4" strokeLinecap="round"/>
              <path d="M-50 35 H50" stroke="#0F2C4A" strokeWidth="4" strokeLinecap="round"/>
            </g>
          </svg>
        )}
      </div>
      <div className="text-xl font-bold text-gray-700 tracking-wider hidden md:block">
        SUNRIVER <span className="font-light">HOTEL</span>
      </div>
    </div>
  );
};
