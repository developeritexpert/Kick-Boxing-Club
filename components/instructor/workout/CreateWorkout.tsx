'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import './CreateWorkout.css';

interface Category {
    id: string;
    name: string;
}

interface Movement {
    id: string;
    name: string;
    video_id: string | null;
    thumbnail_url: string | null;
    duration: number | null;
    category: string;
}

interface SelectedMovement extends Movement {
    order: number;
    customDuration: number; // Per-movement duration
}

interface CategoryLimits {
    [categoryName: string]: number;
}

interface ClassLimitConfig {
    [className: string]: {
        categories: CategoryLimits;
        combined?: string[]; // For combined categories like "Boxing + Kickboxing"
    };
}

// Class-to-category mapping configuration
const CLASS_LIMIT_CONFIG: ClassLimitConfig = {
    'Fitness Kickboxing': {
        categories: {
            HIIT: 9,
            Boxing: 4,
            Kickboxing: 4,
        },
    },
    "Jus' Kickboxing": {
        categories: {
            Boxing: 4,
            Kickboxing: 4,
            HIIT: 9,
        },
    },
    'Power Kickboxing': {
        categories: {
            'Boxing + Kickboxing': 5,
            Strengthening: 5,
        },
        combined: ['Boxing', 'Kickboxing'],
    },
};

const CreateWorkout: React.FC = () => {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [focus, setFocus] = useState('');
    const [movements, setMovements] = useState<Movement[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryMovements, setCategoryMovements] = useState<{
        [key: string]: SelectedMovement[];
    }>({});
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<string | null>(null);
    const [tempSelected, setTempSelected] = useState<SelectedMovement[]>([]);
    const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
    const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
    const [locationId, setLocationId] = useState('');
    const [classId, setClassId] = useState('');
    const [selectedClassName, setSelectedClassName] = useState('');
    const [restAfter, setRestAfter] = useState("");
    
    // Fetch locations, classes, categories, and movements
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [locRes, classRes, catRes, movRes] = await Promise.all([
                    fetch('/api/common/location'),
                    fetch('/api/common/class'),
                    fetch('/api/common/categories'),
                    fetch('/api/common/movements'),
                ]);

                const locData = await locRes.json();
                const classData = await classRes.json();
                const catData = await catRes.json();
                const movData = await movRes.json();

                const locationsArray = Array.isArray(locData)
                    ? locData
                    : Array.isArray(locData.data)
                        ? locData.data
                        : [];

                const classesArray = Array.isArray(classData)
                    ? classData
                    : Array.isArray(classData.data)
                        ? classData.data
                        : [];

                const categoriesArray = catData.categories || [];
                const movementsArray = movData.data || [];

                setLocations(locationsArray || []);
                setClasses(classesArray || []);
                setCategories(categoriesArray || []);
                setMovements(movementsArray || []);

                // Initialize empty movement selections
                const initialMovementState: { [key: string]: SelectedMovement[] } = {};
                categoriesArray.forEach((cat: Category) => {
                    initialMovementState[cat.name] = [];
                });
                setCategoryMovements(initialMovementState);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load required data');
            }
        };

        fetchData();
    }, []);

    // Get limits for current class
    const getClassLimits = (): CategoryLimits => {
        const config = CLASS_LIMIT_CONFIG[selectedClassName];

        if (config) {
            return config.categories;
        }

        // Default: all categories with 5 max each
        const defaultLimits: CategoryLimits = {};
        categories.forEach((cat) => {
            defaultLimits[cat.name] = 5;
        });
        return defaultLimits;
    };

    // Get combined category mapping if applicable
    const getCombinedCategoryMapping = (): string[] | null => {
        const config = CLASS_LIMIT_CONFIG[selectedClassName];
        return config?.combined || null;
    };

    const openPopup = (categoryName: string) => {
        setCurrentCategory(categoryName);
        const existing = categoryMovements[categoryName] || [];
        setTempSelected([...existing]);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setCurrentCategory(null);
        setTempSelected([]);
    };

    const getMaxMovementsForCategory = (categoryName: string): number => {
        const limits = getClassLimits();
        return limits[categoryName] || 5;
    };

    const toggleTempSelection = (movement: Movement) => {
        const maxAllowed = getMaxMovementsForCategory(currentCategory || '');

        setTempSelected((prev) => {
            const exists = prev.find((m) => m.id === movement.id);
            if (exists) {
                return prev.filter((m) => m.id !== movement.id);
            } else {
                if (prev.length >= maxAllowed) {
                    setTimeout(() => {
                        toast.error(`Maximum ${maxAllowed} movements allowed for this category`);
                    }, 0);
                    return prev;
                }
                // return [...prev, { ...movement, order: prev.length + 1 }];
                // Set default custom duration to movement's original duration or 30
                return [...prev, { 
                    ...movement, 
                    order: prev.length + 1,
                    customDuration: movement.duration || 30
                }];
            }
        });
    };

    const saveSelection = () => {
        if (!currentCategory) return;

        setCategoryMovements((prev) => ({
            ...prev,
            [currentCategory]: tempSelected,
        }));

        closePopup();
        toast.success(`${currentCategory} movements updated`);
    };

    const handleMoveUp = (categoryName: string, index: number) => {
        if (index === 0) return;

        setCategoryMovements((prev) => {
            const updated = [...(prev[categoryName] || [])];
            [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
            return {
                ...prev,
                [categoryName]: updated.map((m, i) => ({ ...m, order: i + 1 })),
            };
        });
    };

    const handleMoveDown = (categoryName: string, index: number, length: number) => {
        if (index === length - 1) return;

        setCategoryMovements((prev) => {
            const updated = [...(prev[categoryName] || [])];
            [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
            return {
                ...prev,
                [categoryName]: updated.map((m, i) => ({ ...m, order: i + 1 })),
            };
        });
    };

    const removeMovement = (categoryName: string, movementId: string) => {
        setCategoryMovements((prev) => {
            const filtered = (prev[categoryName] || []).filter((m) => m.id !== movementId);
            return {
                ...prev,
                [categoryName]: filtered.map((m, i) => ({ ...m, order: i + 1 })),
            };
        });
    };

    const updateMovementDuration = (categoryName: string, movementId: string, newDuration: number) => {
        setCategoryMovements((prev) => {
            const updated = (prev[categoryName] || []).map((m) =>
                m.id === movementId ? { ...m, customDuration: newDuration } : m
            );
            return {
                ...prev,
                [categoryName]: updated,
            };
        });
    };

    const handleCancel = () => {
        setName('');
        setDescription('');
        setFocus('');
        setLocationId('');
        setClassId('');
        setSelectedClassName('');
        const resetMovements: { [key: string]: SelectedMovement[] } = {};
        categories.forEach((cat) => {
            resetMovements[cat.name] = [];
        });
        setCategoryMovements(resetMovements);
    };

    const handleClassChange = (newClassId: string) => {
        setClassId(newClassId);
        const selectedClass = classes.find((c) => c.id === newClassId);
        setSelectedClassName(selectedClass?.name || '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Workout name is required');
            return;
        }

        if (!classId) {
            toast.error('Please select a class');
            return;
        }

        if (!focus.trim()) {
            toast.error('Please select workout focus');
            return;
        }

        if (!/^\d+$/.test(restAfter)) {
            toast.error("Rest time must be a whole number in seconds");
            return;
        }

        if (Number(restAfter) > 300) {
            toast.error("Rest time cannot be more than 5 minutes (300 seconds)");
            return;
        }

        // Get categories in display order
        const categoriesToSubmit = getCategoriesToDisplay();
        const allMovements: SelectedMovement[] = [];

        // Flatten movements in category order
        categoriesToSubmit.forEach((categoryName) => {
            const movementsInCategory = categoryMovements[categoryName] || [];
            allMovements.push(...movementsInCategory);
        });

        // const allMovements = Object.values(categoryMovements).flat();

        if (allMovements.length === 0) {
            toast.error('Please select at least one movement');
            return;
        }

        // Validate all movements have valid durations
        const invalidDuration = allMovements.find(m => !m.customDuration || m.customDuration <= 0);
        if (invalidDuration) {
            toast.error('All movements must have a valid duration greater than 0');
            return;
        }

        let created_by = '';
        if (user?.id) {
            created_by = user.id;
        }

        setLoading(true);
        try {
            // const res = await fetch('/api/admin/workout/create', {
            const res = await fetch('/api/instructor/workout/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    locationId,
                    classId,
                    focus,
                    created_by,
                    movements: allMovements.map((m, index) => ({
                        id: m.id,
                        order: index + 1,
                        duration: m.customDuration,
                        rest_after: Number(restAfter),
                    })),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create workout');

            toast.success('Workout created successfully!');
            handleCancel();
            router.push('/instructor/workouts');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Something went wrong';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // Get categories to display based on class selection
    const getCategoriesToDisplay = (): string[] => {
        if (!selectedClassName) return [];

        const config = CLASS_LIMIT_CONFIG[selectedClassName];
        if (config) {
            return Object.keys(config.categories);
        }

        // Default: show all categories
        return categories.map((c) => c.name);
    };

    // Get movements for a specific category (handles combined categories)
    const getMovementsForCategory = (displayName: string): Movement[] => {
        const combined = getCombinedCategoryMapping();

        if (combined && displayName === 'Boxing + Kickboxing') {
            return movements.filter((m) => combined.includes(m.category));
        }

        return movements.filter((m) => m.category === displayName);
    };

   const renderCategoryBox = (categoryName: string) => {
        const selectedMovements = categoryMovements[categoryName] || [];
        const maxAllowed = getMaxMovementsForCategory(categoryName);

        let visibleName = '';
        if (categoryName === 'HIIT' && selectedClassName === "Jus' Kickboxing" ) {
            visibleName = 'Abs/Core';
        } else {
            visibleName = categoryName;
        }

        return (
            <div key={categoryName} className="class-type-box">
                <div className="class-header">
                    <h4>{visibleName}</h4>
                    <button type="button" className="add-btn" onClick={() => openPopup(categoryName)}>
                        + Add
                    </button>
                </div>
                <div className="movement-list">
                    {selectedMovements.length === 0 ? (
                        <p className="empty-text">No movements selected</p>
                    ) : (
                        <>
                            <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                                {selectedMovements.length}/{maxAllowed} movements
                            </p>
                            {selectedMovements.map((m, idx) => (
                                <div key={m.id} className="movement-item-with-controls">
                                    <div style={{ flex: 1 }}>
                                        <span className="movement-name">
                                            {idx + 1}. {m.name.length > 19 ? m.name.substring(0, 19) + '..' : m.name}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                            <input
                                                type="number"
                                                value={m.customDuration}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    if (val > 0 && val <= 600) {
                                                        updateMovementDuration(categoryName, m.id, val);
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (["e", "E", "+", "-", "."].includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                min="0"
                                                max="600"
                                                style={{
                                                    width: '60px',
                                                    padding: '2px 6px',
                                                    fontSize: '12px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                            <span style={{ fontSize: '11px', color: '#666' }}>sec</span>
                                        </div>
                                    </div>
                                    <div className="movement-controls">
                                        <button
                                            type="button"
                                            className="arrow-btn"
                                            onClick={() => handleMoveUp(categoryName, idx)}
                                            disabled={idx === 0}
                                            title="Move up"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            type="button"
                                            className="arrow-btn"
                                            onClick={() =>
                                                handleMoveDown(categoryName, idx, selectedMovements.length)
                                            }
                                            disabled={idx === selectedMovements.length - 1}
                                            title="Move down"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            type="button"
                                            className="remove-btn"
                                            onClick={() => removeMovement(categoryName, m.id)}
                                            title="Remove"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        );
    };

    const categoriesToDisplay = getCategoriesToDisplay();
    const filteredMovements = currentCategory ? getMovementsForCategory(currentCategory) : [];
    const currentMaxMovements = getMaxMovementsForCategory(currentCategory || '');

    return (
        <div className="create-workout-container instructor-create-workout">
            <h2>Create New Workout</h2>

            <div className="workout-layout">
                <div className="left-section">
                    <div className="create-workout-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Workout Name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter workout name"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Location</label>
                                <select
                                    value={locationId}
                                    onChange={(e) => setLocationId(e.target.value)}
                                    required
                                >
                                    <option value="">Select Location</option>
                                    {locations.map((loc) => (
                                        <option key={loc.id} value={loc.id}>
                                            {loc.name.length > 20 ? `${loc.name.slice(0, 20)}...` : loc.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Class</label>
                                <select
                                    value={classId}
                                    onChange={(e) => handleClassChange(e.target.value)}
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name.length > 20 ? `${cls.name.slice(0, 20)}...` : cls.name}

                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">  
                            <div className="form-group">
                                <label>Rest Time (After Each Movement)</label>
                                <div className="time-input">
                                    <input
                                        type="number"
                                        value={restAfter}
                                        // onChange={(e) => setRestAfter(e.target.value)}
                                        onChange={(e) => {
                                            const val = e.target.value;

                                            if (val === "") {
                                                setRestAfter("");
                                                return;
                                            }
                                            const num = Number(val);
                                            if (num > 300) {
                                                setRestAfter('300');
                                                return;
                                            }
                                            setRestAfter(String(num));
                                        }}
                                        onKeyDown={(e) => {
                                            if (["e", "E", "+", "-", "."].includes(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        placeholder="Enter rest time"
                                        min="0"
                                        max="300"
                                        required
                                    />
                                    <span className="suffix">sec</span>
                                </div>
                            </div>
                        </div>

                        <div className="form-group focus-group">
                            <label>Focus</label>
                            <div className="focus-buttons">
                                {['Upper Body', 'Lower Body', 'Full Body'].map((f) => (
                                    <button
                                        key={f}
                                        type="button"
                                        className={`focus-btn ${focus === f ? 'active' : ''}`}
                                        onClick={() => setFocus(f)}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="workout-list-section">
                            <h4>Available Movements ({movements.length})</h4>
                            <div className="workout-items hide-scrollbar">
                                {movements.map((m) => (
                                    <div key={m.id} className="workout-item">
                                        <span>{m.name.length > 65 ? m.name.substring(0, 65) + '...' : m.name}</span>
                                        <small> {m.category}</small>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="button-group">
                            <button type="button" className="btn cancel" onClick={handleCancel}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn create"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="right-section">
                    <h3>Workout Movements</h3>

                    {!selectedClassName && (
                        <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                            Please select a class to see movement categories
                        </p>
                    )}

                    {categoriesToDisplay.map((categoryName) => renderCategoryBox(categoryName))}
                </div>
            </div>

            {/* Modal */}
            {showPopup && (
                <div className="modal-overlay" onClick={closePopup}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Select {currentCategory} Movements</h3>
                            <button className="close-btn" onClick={closePopup}>
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            {filteredMovements.length === 0 ? (
                                <p className="empty-text">
                                    No movements available for this category
                                </p>
                            ) : (
                                <>
                                    <p style={{ marginBottom: '16px', color: '#666' }}>
                                        Selected: {tempSelected.length}/{currentMaxMovements}
                                    </p>
                                    <div className="movements-grid">
                                        {filteredMovements.map((m) => {
                                            const isSelected = tempSelected.some(
                                                (sel) => sel.id === m.id,
                                            );
                                            const selectionOrder = tempSelected.findIndex(
                                                (sel) => sel.id === m.id,
                                            );

                                            return (
                                                <div
                                                    key={m.id}
                                                    className={`movement-card ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => toggleTempSelection(m)}
                                                >
                                                    {isSelected && (
                                                        <div className="selection-badge">
                                                            {selectionOrder + 1}
                                                        </div>
                                                    )}
                                                    <img
                                                        src={
                                                            m.thumbnail_url ||
                                                            '/placeholder-thumb.png'
                                                        }
                                                        alt={m.name.length > 20 ? m.name.substring(0, 20) + '...' : m.name}
                                                        className="movement-thumb"
                                                    />
                                                    <p>{m.name.length > 65 ? m.name.substring(0, 65) + '...' : m.name}</p>
                                                    <small>
                                                        {m.duration
                                                            ? `${m.duration}s (default)`
                                                            : 'No duration'}
                                                    </small>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn cancel" onClick={closePopup}>
                                Cancel
                            </button>
                            <button className="btn create" onClick={saveSelection}>
                                Save ({tempSelected.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateWorkout;




































// // code as per admin requirement 
// 'use client';

// import React, { useEffect, useState } from 'react';
// import toast from 'react-hot-toast';
// import { useAuthStore } from '@/stores/useAuthStore';
// import { useRouter } from 'next/navigation';
// import './CreateWorkout.css';

// interface Category {
//     id: string;
//     name: string;
// }

// interface Movement {
//     id: string;
//     name: string;
//     video_id: string | null;
//     thumbnail_url: string | null;
//     duration: number | null;
//     category: string;
// }

// interface SelectedMovement extends Movement {
//     order: number;
// }

// interface CategoryLimits {
//     [categoryName: string]: number;
// }

// interface ClassLimitConfig {
//     [className: string]: {
//         categories: CategoryLimits;
//         combined?: string[]; // For combined categories like "Boxing + Kickboxing"
//     };
// }

// // Class-to-category mapping configuration
// const CLASS_LIMIT_CONFIG: ClassLimitConfig = {
//     'Fitness Kickboxing': {
//         categories: {
//             HIIT: 9,
//             Boxing: 4,
//             Kickboxing: 4,
//         },
//     },
//     "Jus' Kickboxing": {
//         categories: {
//             Boxing: 4,
//             Kickboxing: 4,
//             HIIT: 9,
//         },
//     },
//     'Power Kickboxing': {
//         categories: {
//             'Boxing + Kickboxing': 5,
//             Strengthening: 5,
//         },
//         combined: ['Boxing', 'Kickboxing'],
//     },
// };

// const CreateWorkout: React.FC = () => {
//     const user = useAuthStore((state) => state.user);
//     const router = useRouter();
//     const [name, setName] = useState('');
//     const [description, setDescription] = useState('');
//     const [focus, setFocus] = useState('');
//     const [movements, setMovements] = useState<Movement[]>([]);
//     const [categories, setCategories] = useState<Category[]>([]);
//     const [categoryMovements, setCategoryMovements] = useState<{
//         [key: string]: SelectedMovement[];
//     }>({});
//     const [loading, setLoading] = useState(false);
//     const [showPopup, setShowPopup] = useState(false);
//     const [currentCategory, setCurrentCategory] = useState<string | null>(null);
//     const [tempSelected, setTempSelected] = useState<SelectedMovement[]>([]);
//     const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
//     const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
//     const [locationId, setLocationId] = useState('');
//     const [classId, setClassId] = useState('');
//     const [selectedClassName, setSelectedClassName] = useState('');
//     const [restAfter, setRestAfter] = useState("");
    
//     // Fetch locations, classes, categories, and movements
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const [locRes, classRes, catRes, movRes] = await Promise.all([
//                     fetch('/api/common/location'),
//                     fetch('/api/common/class'),
//                     fetch('/api/common/categories'),
//                     fetch('/api/common/movements'),
//                 ]);

//                 const locData = await locRes.json();
//                 const classData = await classRes.json();
//                 const catData = await catRes.json();
//                 const movData = await movRes.json();

//                 const locationsArray = Array.isArray(locData)
//                     ? locData
//                     : Array.isArray(locData.data)
//                         ? locData.data
//                         : [];

//                 const classesArray = Array.isArray(classData)
//                     ? classData
//                     : Array.isArray(classData.data)
//                         ? classData.data
//                         : [];

//                 const categoriesArray = catData.categories || [];
//                 const movementsArray = movData.data || [];

//                 setLocations(locationsArray || []);
//                 setClasses(classesArray || []);
//                 setCategories(categoriesArray || []);
//                 setMovements(movementsArray || []);

//                 // Initialize empty movement selections
//                 const initialMovementState: { [key: string]: SelectedMovement[] } = {};
//                 categoriesArray.forEach((cat: Category) => {
//                     initialMovementState[cat.name] = [];
//                 });
//                 setCategoryMovements(initialMovementState);
//             } catch (error) {
//                 console.error('Error fetching data:', error);
//                 toast.error('Failed to load required data');
//             }
//         };

//         fetchData();
//     }, []);

//     // Get limits for current class
//     const getClassLimits = (): CategoryLimits => {
//         const config = CLASS_LIMIT_CONFIG[selectedClassName];

//         if (config) {
//             return config.categories;
//         }

//         // Default: all categories with 5 max each
//         const defaultLimits: CategoryLimits = {};
//         categories.forEach((cat) => {
//             defaultLimits[cat.name] = 5;
//         });
//         return defaultLimits;
//     };

//     // Get combined category mapping if applicable
//     const getCombinedCategoryMapping = (): string[] | null => {
//         const config = CLASS_LIMIT_CONFIG[selectedClassName];
//         return config?.combined || null;
//     };

//     const openPopup = (categoryName: string) => {
//         setCurrentCategory(categoryName);
//         const existing = categoryMovements[categoryName] || [];
//         setTempSelected([...existing]);
//         setShowPopup(true);
//     };

//     const closePopup = () => {
//         setShowPopup(false);
//         setCurrentCategory(null);
//         setTempSelected([]);
//     };

//     const getMaxMovementsForCategory = (categoryName: string): number => {
//         const limits = getClassLimits();
//         return limits[categoryName] || 5;
//     };

//     const toggleTempSelection = (movement: Movement) => {
//         const maxAllowed = getMaxMovementsForCategory(currentCategory || '');

//         setTempSelected((prev) => {
//             const exists = prev.find((m) => m.id === movement.id);
//             if (exists) {
//                 return prev.filter((m) => m.id !== movement.id);
//             } else {
//                 if (prev.length >= maxAllowed) {
//                     setTimeout(() => {
//                         toast.error(`Maximum ${maxAllowed} movements allowed for this category`);
//                     }, 0);
//                     return prev;
//                 }
//                 return [...prev, { ...movement, order: prev.length + 1 }];
//             }
//         });
//     };

//     const saveSelection = () => {
//         if (!currentCategory) return;

//         setCategoryMovements((prev) => ({
//             ...prev,
//             [currentCategory]: tempSelected,
//         }));

//         closePopup();
//         toast.success(`${currentCategory} movements updated`);
//     };

//     const handleMoveUp = (categoryName: string, index: number) => {
//         if (index === 0) return;

//         setCategoryMovements((prev) => {
//             const updated = [...(prev[categoryName] || [])];
//             [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
//             return {
//                 ...prev,
//                 [categoryName]: updated.map((m, i) => ({ ...m, order: i + 1 })),
//             };
//         });
//     };

//     const handleMoveDown = (categoryName: string, index: number, length: number) => {
//         if (index === length - 1) return;

//         setCategoryMovements((prev) => {
//             const updated = [...(prev[categoryName] || [])];
//             [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
//             return {
//                 ...prev,
//                 [categoryName]: updated.map((m, i) => ({ ...m, order: i + 1 })),
//             };
//         });
//     };

//     const removeMovement = (categoryName: string, movementId: string) => {
//         setCategoryMovements((prev) => {
//             const filtered = (prev[categoryName] || []).filter((m) => m.id !== movementId);
//             return {
//                 ...prev,
//                 [categoryName]: filtered.map((m, i) => ({ ...m, order: i + 1 })),
//             };
//         });
//     };

//     const handleCancel = () => {
//         setName('');
//         setDescription('');
//         setFocus('');
//         setLocationId('');
//         setClassId('');
//         setSelectedClassName('');
//         const resetMovements: { [key: string]: SelectedMovement[] } = {};
//         categories.forEach((cat) => {
//             resetMovements[cat.name] = [];
//         });
//         setCategoryMovements(resetMovements);
//     };

//     const handleClassChange = (newClassId: string) => {
//         setClassId(newClassId);
//         const selectedClass = classes.find((c) => c.id === newClassId);
//         setSelectedClassName(selectedClass?.name || '');
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!name.trim()) {
//             toast.error('Workout name is required');
//             return;
//         }

//         if (!classId) {
//             toast.error('Please select a class');
//             return;
//         }

//         if (!focus.trim()) {
//             toast.error('Please select workout focus');
//             return;
//         }

//         if (!/^\d+$/.test(restAfter)) {
//             toast.error("Rest time must be a whole number in seconds");
//             return;
//         }

//         if (Number(restAfter) > 300) {
//             toast.error("Rest time cannot be more than 5 minutes (300 seconds)");
//             return;
//         }

//         // Get categories in display order
//         const categoriesToSubmit = getCategoriesToDisplay();
//         const allMovements: SelectedMovement[] = [];

//         // Flatten movements in category order
//         categoriesToSubmit.forEach((categoryName) => {
//             const movementsInCategory = categoryMovements[categoryName] || [];
//             allMovements.push(...movementsInCategory);
//         });

//         // const allMovements = Object.values(categoryMovements).flat();

//         if (allMovements.length === 0) {
//             toast.error('Please select at least one movement');
//             return;
//         }

//         let created_by = '';
//         if (user?.id) {
//             created_by = user.id;
//         }

//         setLoading(true);
//         try {
//             // const res = await fetch('/api/admin/workout/create', {
//             const res = await fetch('/api/instructor/workout/create', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     name,
//                     description,
//                     locationId,
//                     classId,
//                     focus,
//                     created_by,
//                     movements: allMovements.map((m, index) => ({
//                         id: m.id,
//                         order: index + 1,
//                         duration: m.duration || 30,
//                         rest_after: Number(restAfter),
//                     })),
//                 }),
//             });
//             const data = await res.json();
//             if (!res.ok) throw new Error(data.error || 'Failed to create workout');

//             toast.success('Workout created successfully!');
//             handleCancel();
//             router.push('/instructor/workouts');
//         } catch (err) {
//             const message = err instanceof Error ? err.message : 'Something went wrong';
//             toast.error(message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Get categories to display based on class selection
//     const getCategoriesToDisplay = (): string[] => {
//         if (!selectedClassName) return [];

//         const config = CLASS_LIMIT_CONFIG[selectedClassName];
//         if (config) {
//             return Object.keys(config.categories);
//         }

//         // Default: show all categories
//         return categories.map((c) => c.name);
//     };

//     // Get movements for a specific category (handles combined categories)
//     const getMovementsForCategory = (displayName: string): Movement[] => {
//         const combined = getCombinedCategoryMapping();

//         if (combined && displayName === 'Boxing + Kickboxing') {
//             return movements.filter((m) => combined.includes(m.category));
//         }

//         return movements.filter((m) => m.category === displayName);
//     };

//     const renderCategoryBox = (categoryName: string) => {
//         const selectedMovements = categoryMovements[categoryName] || [];
//         const maxAllowed = getMaxMovementsForCategory(categoryName);

//         return (
//             <div key={categoryName} className="class-type-box">
//                 <div className="class-header">
//                     <h4>{categoryName}</h4>
//                     <button type="button" className="add-btn" onClick={() => openPopup(categoryName)}>
//                         + Add
//                     </button>
//                 </div>
//                 <div className="movement-list">
//                     {selectedMovements.length === 0 ? (
//                         <p className="empty-text">No movements selected</p>
//                     ) : (
//                         <>
//                             <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
//                                 {selectedMovements.length}/{maxAllowed} movements
//                             </p>
//                             {selectedMovements.map((m, idx) => (
//                                 <div key={m.id} className="movement-item-with-controls">
//                                     <span className="movement-name">
//                                         {idx + 1}. {m.name.length > 19 ? m.name.substring(0, 19) + '...' : m.name}
//                                     </span>
//                                     <div className="movement-controls">
//                                         <button
//                                             type="button"
//                                             className="arrow-btn"
//                                             onClick={() => handleMoveUp(categoryName, idx)}
//                                             disabled={idx === 0}
//                                             title="Move up"
//                                         >
//                                             ↑
//                                         </button>
//                                         <button
//                                             type="button"
//                                             className="arrow-btn"
//                                             onClick={() =>
//                                                 handleMoveDown(categoryName, idx, selectedMovements.length)
//                                             }
//                                             disabled={idx === selectedMovements.length - 1}
//                                             title="Move down"
//                                         >
//                                             ↓
//                                         </button>
//                                         <button
//                                             type="button"
//                                             className="remove-btn"
//                                             onClick={() => removeMovement(categoryName, m.id)}
//                                             title="Remove"
//                                         >
//                                             ×
//                                         </button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </>
//                     )}
//                 </div>
//             </div>
//         );
//     };

//     const categoriesToDisplay = getCategoriesToDisplay();
//     const filteredMovements = currentCategory ? getMovementsForCategory(currentCategory) : [];
//     const currentMaxMovements = getMaxMovementsForCategory(currentCategory || '');

//     return (
//         <div className="create-workout-container instructor-create-workout">
//             <h2>Create New Workout</h2>

//             <div className="workout-layout">
//                 <div className="left-section">
//                     <div className="create-workout-form" onSubmit={handleSubmit}>
//                         <div className="form-group">
//                             <label>Workout Name</label>
//                             <input
//                                 value={name}
//                                 onChange={(e) => setName(e.target.value)}
//                                 placeholder="Enter workout name"
//                                 required
//                             />
//                         </div>

//                         <div className="form-row">
//                             <div className="form-group">
//                                 <label>Location</label>
//                                 <select
//                                     value={locationId}
//                                     onChange={(e) => setLocationId(e.target.value)}
//                                     required
//                                 >
//                                     <option value="">Select Location</option>
//                                     {locations.map((loc) => (
//                                         <option key={loc.id} value={loc.id}>
//                                             {loc.name.length > 20 ? `${loc.name.slice(0, 20)}...` : loc.name}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>

//                             <div className="form-group">
//                                 <label>Class</label>
//                                 <select
//                                     value={classId}
//                                     onChange={(e) => handleClassChange(e.target.value)}
//                                     required
//                                 >
//                                     <option value="">Select Class</option>
//                                     {classes.map((cls) => (
//                                         <option key={cls.id} value={cls.id}>
//                                             {cls.name.length > 20 ? `${cls.name.slice(0, 20)}...` : cls.name}

//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                         </div>

//                         <div className="form-row">  
//                             <div className="form-group">
//                                 <label>Rest Time</label>
//                                 <div className="time-input">
//                                     <input
//                                         type="number"
//                                         value={restAfter}
//                                         // onChange={(e) => setRestAfter(e.target.value)}
//                                         onChange={(e) => {
//                                             const val = e.target.value;

//                                             if (val === "") {
//                                                 setRestAfter("");
//                                                 return;
//                                             }
//                                             const num = Number(val);
//                                             if (num > 300) {
//                                                 setRestAfter('300');
//                                                 return;
//                                             }
//                                             setRestAfter(String(num));
//                                         }}
//                                         onKeyDown={(e) => {
//                                             if (["e", "E", "+", "-", "."].includes(e.key)) {
//                                                 e.preventDefault();
//                                             }
//                                         }}
//                                         placeholder="Enter rest time"
//                                         min="0"
//                                         max="300"
//                                         required
//                                     />
//                                     <span className="suffix">sec</span>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="form-group focus-group">
//                             <label>Focus</label>
//                             <div className="focus-buttons">
//                                 {['Upper Body', 'Lower Body', 'Full Body'].map((f) => (
//                                     <button
//                                         key={f}
//                                         type="button"
//                                         className={`focus-btn ${focus === f ? 'active' : ''}`}
//                                         onClick={() => setFocus(f)}
//                                     >
//                                         {f}
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>

//                         <div className="workout-list-section">
//                             <h4>Available Movements ({movements.length})</h4>
//                             <div className="workout-items hide-scrollbar">
//                                 {movements.map((m) => (
//                                     <div key={m.id} className="workout-item">
//                                         <span>{m.name.length > 65 ? m.name.substring(0, 65) + '...' : m.name}</span>
//                                         <small> {m.category}</small>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         <div className="button-group">
//                             <button type="button" className="btn cancel" onClick={handleCancel}>
//                                 Cancel
//                             </button>
//                             <button
//                                 type="button"
//                                 className="btn create"
//                                 onClick={handleSubmit}
//                                 disabled={loading}
//                             >
//                                 {loading ? 'Creating...' : 'Create'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="right-section">
//                     <h3>Workout Movements</h3>

//                     {!selectedClassName && (
//                         <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
//                             Please select a class to see movement categories
//                         </p>
//                     )}

//                     {categoriesToDisplay.map((categoryName) => renderCategoryBox(categoryName))}
//                 </div>
//             </div>

//             {/* Modal */}
//             {showPopup && (
//                 <div className="modal-overlay" onClick={closePopup}>
//                     <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//                         <div className="modal-header">
//                             <h3>Select {currentCategory} Movements</h3>
//                             <button className="close-btn" onClick={closePopup}>
//                                 ×
//                             </button>
//                         </div>

//                         <div className="modal-body">
//                             {filteredMovements.length === 0 ? (
//                                 <p className="empty-text">
//                                     No movements available for this category
//                                 </p>
//                             ) : (
//                                 <>
//                                     <p style={{ marginBottom: '16px', color: '#666' }}>
//                                         Selected: {tempSelected.length}/{currentMaxMovements}
//                                     </p>
//                                     <div className="movements-grid">
//                                         {filteredMovements.map((m) => {
//                                             const isSelected = tempSelected.some(
//                                                 (sel) => sel.id === m.id,
//                                             );
//                                             const selectionOrder = tempSelected.findIndex(
//                                                 (sel) => sel.id === m.id,
//                                             );

//                                             return (
//                                                 <div
//                                                     key={m.id}
//                                                     className={`movement-card ${isSelected ? 'selected' : ''}`}
//                                                     onClick={() => toggleTempSelection(m)}
//                                                 >
//                                                     {isSelected && (
//                                                         <div className="selection-badge">
//                                                             {selectionOrder + 1}
//                                                         </div>
//                                                     )}
//                                                     <img
//                                                         src={
//                                                             m.thumbnail_url ||
//                                                             '/placeholder-thumb.png'
//                                                         }
//                                                         alt={m.name.length > 20 ? m.name.substring(0, 20) + '...' : m.name}
//                                                         className="movement-thumb"
//                                                     />
//                                                     <p>{m.name.length > 65 ? m.name.substring(0, 65) + '...' : m.name}</p>
//                                                     <small>
//                                                         {m.duration
//                                                             ? `${m.duration}s`
//                                                             : 'No duration'}
//                                                     </small>
//                                                 </div>
//                                             );
//                                         })}
//                                     </div>
//                                 </>
//                             )}
//                         </div>

//                         <div className="modal-footer">
//                             <button className="btn cancel" onClick={closePopup}>
//                                 Cancel
//                             </button>
//                             <button className="btn create" onClick={saveSelection}>
//                                 Save ({tempSelected.length})
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default CreateWorkout;