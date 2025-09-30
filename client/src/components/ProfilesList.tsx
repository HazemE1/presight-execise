import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import ProfileCard from './profile';
import type { Profile } from '../../../models/profile';

interface ProfilesListProps {
    searchTerm: string;
    selectedHobbies: string[];
    selectedNationalities: string[];
}

export default function ProfilesList({ searchTerm, selectedHobbies, selectedNationalities }: ProfilesListProps) {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    const parentRef = React.useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false);

    const virtualizer = useVirtualizer({
        count: profiles.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 144,
        overscan: 5,
    });

    const fetchProfiles = useCallback(async (pageNum: number, reset = false) => {
        if (loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pageNum.toString(),
                limit: '20',
                search: searchTerm,
                hobbies: selectedHobbies.join(','),
                nationalities: selectedNationalities.join(',')
            });

            const response = await fetch(`http://localhost:4000/api/profiles?${params}`);
            const data = await response.json();

            if (reset) {
                setProfiles(data.profiles);
            } else {
                setProfiles(prev => [...prev, ...data.profiles]);
            }

            setHasMore(data.hasMore);
            setPage(pageNum);
            console.log('Fetched profiles:', {
                page: pageNum,
                profilesCount: data.profiles.length,
                hasMore: data.hasMore,
                reset
            });
        } catch (error) {
            console.error('Error fetching profiles:', error);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [searchTerm, selectedHobbies, selectedNationalities]);

    useEffect(() => {
        setPage(1);
        setProfiles([]);
        setHasMore(true);
        fetchProfiles(1, true);
    }, [searchTerm, selectedHobbies, selectedNationalities, fetchProfiles]);

    // Load more when reaching the end
    useEffect(() => {
        const scrollElement = parentRef.current;
        if (!scrollElement) return;

        const handleScroll = () => {
            const virtualItems = virtualizer.getVirtualItems();
            const [lastVirtualItem] = [...virtualItems].reverse();

            if (!lastVirtualItem) return;

            console.log('Virtual scroll check:', {
                lastItemIndex: lastVirtualItem.index,
                profilesLength: profiles.length,
                hasMore,
                loading,
                page
            });

            if (
                lastVirtualItem.index >= profiles.length - 1 &&
                hasMore &&
                !loading
            ) {
                console.log('Loading more profiles...');
                fetchProfiles(page + 1, false);
            }
        };

        scrollElement.addEventListener('scroll', handleScroll);
        return () => scrollElement.removeEventListener('scroll', handleScroll);
    }, [virtualizer, profiles.length, hasMore, loading, page, fetchProfiles]);

    return (
        <div className="flex-1">
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                    Profiles ({profiles.length})
                </h2>
            </div>

            <div
                ref={parentRef}
                className="h-96 overflow-auto"
                style={{ contain: 'strict' }}
            >
                <div
                    style={{
                        height: `${virtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    {virtualizer.getVirtualItems().map((virtualItem) => (
                        <div
                            key={virtualItem.key}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualItem.size}px`,
                                transform: `translateY(${virtualItem.start}px)`,
                            }}
                        >
                            <div className="pb-2">
                                <ProfileCard profile={profiles[virtualItem.index]} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {loading && (
                <div className="flex justify-center py-4">
                    <div className="text-gray-600">Loading more profiles...</div>
                </div>
            )}
        </div>
    );
}