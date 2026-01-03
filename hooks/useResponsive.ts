import { useState, useEffect } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

interface UseResponsiveReturn {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    breakpoint: Breakpoint;
    width: number;
    height: number;
}

export const useResponsive = (): UseResponsiveReturn => {
    const [dimensions, setDimensions] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
    });

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);

        // Initial call
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = dimensions.width < 768;
    const isTablet = dimensions.width >= 768 && dimensions.width < 1024;
    const isDesktop = dimensions.width >= 1024;

    const breakpoint: Breakpoint = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

    return {
        isMobile,
        isTablet,
        isDesktop,
        breakpoint,
        width: dimensions.width,
        height: dimensions.height,
    };
};
