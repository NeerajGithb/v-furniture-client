import { useMediaQuery } from '@/utils/useMediaQuery';
import HeaderNavigation from './HeaderNavigation';
import HeaderSearch from './HeaderSearch';
import TopHeaderBar from './TopHeaderBar';
import MainHeader from './MainHeader';

interface HeaderShellProps {
    activeInspiration: string | null;
    tabPosition: DOMRect | null;
    onInspirationEnter: (name: string) => void;
    onGetTabPosition: (rect: DOMRect) => void;
    onInspirationLeave: () => void;
    onClearTimeout: () => void;
    onCloseMegaMenu: () => void;
}

const HeaderShell = ({
    activeInspiration,
    tabPosition,
    onInspirationEnter,
    onGetTabPosition,
    onInspirationLeave,
    onClearTimeout,
    onCloseMegaMenu,
}: HeaderShellProps) => {
    const isMobile = useMediaQuery('(max-width: 639px)');

    return (
        <>
            {/* Desktop: TopHeaderBar - Scrolls away */}
            <div className="hidden sm:block">
                <TopHeaderBar />
            </div>

            {/* Mobile: MainHeader is sticky | Desktop: MainHeader scrolls away */}
            <div className={isMobile ? 'sticky top-0 z-50 bg-white dark:bg-[#0f1419]' : 'bg-white dark:bg-[#0f1419]'}>
                <MainHeader />
            </div>

            {/* Mobile: Search bar - Scrolls with page */}
            <div className="sm:hidden w-full px-3 py-2.5 bg-white dark:bg-[#0f1419] border-b border-gray-100 dark:border-gray-800">
                <HeaderSearch />
            </div>

            {/* Desktop: HeaderNavigation - Sticky at top */}
            {!isMobile && (
                <div
                    className="sticky top-0 z-50 bg-white dark:bg-[#0f1419] border-t border-gray-100 dark:border-gray-800 shadow-sm"
                >
                    <div className="max-w-400 mx-auto px-2 md:px-6">
                        <HeaderNavigation
                            activeInspiration={activeInspiration}
                            tabPosition={tabPosition}
                            onInspirationEnter={onInspirationEnter}
                            onGetTabPosition={onGetTabPosition}
                            onClearTimeout={onClearTimeout}
                            onCloseMegaMenu={onCloseMegaMenu}
                            onInspirationLeave={onInspirationLeave}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default HeaderShell;