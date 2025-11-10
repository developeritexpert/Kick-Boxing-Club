'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/useAuthStore';
import './CreateWorkout.css';

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
}

const CreateWorkout: React.FC = () => {
    const user = useAuthStore((state) => state.user);

    const [openLocation, setOpenLocation] = useState(false);
    const [locationValue, setLocationValue] = useState('');

    const [openClass, setOpenClass] = useState(false);
    const [classValue, setClassValue] = useState('');

    const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
    const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
    const [locationId, setLocationId] = useState('');
    const [classId, setClassId] = useState('');

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [focus, setFocus] = useState('');
    const [movements, setMovements] = useState<Movement[]>([]);
    const [boxingMovements, setBoxingMovements] = useState<SelectedMovement[]>([]);
    const [kickboxingMovements, setKickboxingMovements] = useState<SelectedMovement[]>([]);
    const [hiitMovements, setHiitMovements] = useState<SelectedMovement[]>([]);
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<'boxing' | 'kickboxing' | 'hiit' | null>(
        null,
    );
    const [tempSelected, setTempSelected] = useState<SelectedMovement[]>([]);

    const MAX_MOVEMENTS_PER_CATEGORY = 5;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [locRes, classRes, movRes] = await Promise.all([
                    fetch('/api/common/location'),
                    fetch('/api/common/class'),
                    fetch('/api/common/movements'),
                ]);

                const locData = await locRes.json();
                const classData = await classRes.json();
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

                setLocations(locationsArray || []);
                setClasses(classesArray || []);

                if (locationsArray.length > 0) {
                    setLocationValue(locationsArray[0].name);
                    setLocationId(locationsArray[0].id);
                }
                if (classesArray.length > 0) {
                    setClassValue(classesArray[0].name);
                    setClassId(classesArray[0].id);
                }

                if (!movRes.ok) throw new Error(movData.error || 'Failed to load movements');
                setMovements(movData.data || []);
            } catch (error) {
                console.error('Error fetching data:', error);
                const message = error instanceof Error ? error.message : 'Failed to load data';
                toast.error(message);
            }
        };

        fetchData();
    }, []);

    const openPopup = (category: 'boxing' | 'kickboxing' | 'hiit') => {
        setCurrentCategory(category);
        const existingSelections =
            category === 'boxing'
                ? boxingMovements
                : category === 'kickboxing'
                  ? kickboxingMovements
                  : hiitMovements;
        setTempSelected([...existingSelections]);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setCurrentCategory(null);
        setTempSelected([]);
    };

    const toggleTempSelection = (movement: Movement) => {
        setTempSelected((prev) => {
            const exists = prev.find((m) => m.id === movement.id);
            if (exists) {
                return prev.filter((m) => m.id !== movement.id);
            } else {
                if (prev.length >= MAX_MOVEMENTS_PER_CATEGORY) {
                    setTimeout(() => {
                        toast.error(
                            `Maximum ${MAX_MOVEMENTS_PER_CATEGORY} movements allowed per category`,
                        );
                    }, 0);
                    return prev;
                }
                return [...prev, { ...movement, order: prev.length + 1 }];
            }
        });
    };

    const saveSelection = () => {
        if (!currentCategory) return;

        if (currentCategory === 'boxing') {
            setBoxingMovements(tempSelected);
        } else if (currentCategory === 'kickboxing') {
            setKickboxingMovements(tempSelected);
        } else {
            setHiitMovements(tempSelected);
        }

        closePopup();
        const categoryName = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
        toast.success(`${categoryName} movements updated`);
    };

    const handleMoveUp = (category: 'boxing' | 'kickboxing' | 'hiit', index: number) => {
        if (index === 0) return;

        const setter =
            category === 'boxing'
                ? setBoxingMovements
                : category === 'kickboxing'
                  ? setKickboxingMovements
                  : setHiitMovements;

        setter((prev) => {
            const updated = [...prev];
            [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
            return updated.map((m, i) => ({ ...m, order: i + 1 }));
        });
    };

    const handleMoveDown = (
        category: 'boxing' | 'kickboxing' | 'hiit',
        index: number,
        length: number,
    ) => {
        if (index === length - 1) return;

        const setter =
            category === 'boxing'
                ? setBoxingMovements
                : category === 'kickboxing'
                  ? setKickboxingMovements
                  : setHiitMovements;

        setter((prev) => {
            const updated = [...prev];
            [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
            return updated.map((m, i) => ({ ...m, order: i + 1 }));
        });
    };

    const removeMovement = (category: 'boxing' | 'kickboxing' | 'hiit', movementId: string) => {
        const setter =
            category === 'boxing'
                ? setBoxingMovements
                : category === 'kickboxing'
                  ? setKickboxingMovements
                  : setHiitMovements;

        setter((prev) => {
            const filtered = prev.filter((m) => m.id !== movementId);
            return filtered.map((m, i) => ({ ...m, order: i + 1 }));
        });
    };

    const handleCancel = () => {
        setName('');
        setDescription('');
        setFocus('');
        setBoxingMovements([]);
        setKickboxingMovements([]);
        setHiitMovements([]);

        if (locations.length > 0) {
            setLocationValue(locations[0].name);
            setLocationId(locations[0].id);
        }
        if (classes.length > 0) {
            setClassValue(classes[0].name);
            setClassId(classes[0].id);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Workout name is required');
            return;
        }

        const allMovements = [...boxingMovements, ...kickboxingMovements, ...hiitMovements];

        if (allMovements.length === 0) {
            toast.error('Please select at least one movement');
            return;
        }

        let created_by = '';
        if (user?.id) {
            created_by = user.id;
            console.log('workout stored by user id:', user.id);
        }

        setLoading(true);
        try {
            const res = await fetch('/api/content-admin/workout/create', {
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
                        duration: m.duration || 30,
                        rest_after: 30,
                    })),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create workout');

            toast.success('Workout created successfully!');
            handleCancel();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Something went wrong';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const filteredMovements = currentCategory
        ? movements.filter((m) => m.category.toLowerCase() === currentCategory.toLowerCase())
        : [];

    const renderCategoryBox = (
        category: 'boxing' | 'kickboxing' | 'hiit',
        title: string,
        selectedMovements: SelectedMovement[],
    ) => (
        <div className="class-type-box">
            <div className="class-header">
                <h4>{title}</h4>
                <button type="button" className="add-btn" onClick={() => openPopup(category)}>
                    + Add
                </button>
            </div>
            <div className="movement-list">
                {selectedMovements.length === 0 ? (
                    <p className="empty-text">No movements selected</p>
                ) : (
                    <>
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                            {selectedMovements.length}/{MAX_MOVEMENTS_PER_CATEGORY} movements
                        </p>
                        {selectedMovements.map((m, idx) => (
                            <div key={m.id} className="movement-item-with-controls">
                                <span className="movement-name">
                                    {idx + 1}. {m.name}
                                </span>
                                <div className="movement-controls">
                                    <button
                                        type="button"
                                        className="arrow-btn"
                                        onClick={() => handleMoveUp(category, idx)}
                                        disabled={idx === 0}
                                        title="Move up"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        type="button"
                                        className="arrow-btn"
                                        onClick={() =>
                                            handleMoveDown(category, idx, selectedMovements.length)
                                        }
                                        disabled={idx === selectedMovements.length - 1}
                                        title="Move down"
                                    >
                                        ↓
                                    </button>
                                    <button
                                        type="button"
                                        className="remove-btn"
                                        onClick={() => removeMovement(category, m.id)}
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

    return (
        <div className="create-workout-container content-admin-create-workout">
            <h2>Create New Workout</h2>

            <div className="workout-layout">
                <div className="left-section">
                    <form className="create-workout-form" onSubmit={handleSubmit}>
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
                                <div className="customDropdown">
                                    <button
                                        type="button"
                                        className={`dropdownBtn ${openLocation ? 'active' : ''}`}
                                        onClick={() => setOpenLocation(!openLocation)}
                                    >
                                        {locationValue || 'Select Location'}
                                    </button>

                                    {openLocation && (
                                        <ul className="dropdownList">
                                            {locations.map((loc) => (
                                                <li
                                                    key={loc.id}
                                                    className="dropdownItem"
                                                    onClick={() => {
                                                        setLocationValue(loc.name);
                                                        setLocationId(loc.id);
                                                        setOpenLocation(false);
                                                    }}
                                                >
                                                    {loc.name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Class</label>
                                <div className="customDropdown">
                                    <button
                                        type="button"
                                        className={`dropdownBtn ${openClass ? 'active' : ''}`}
                                        onClick={() => setOpenClass(!openClass)}
                                    >
                                        {classValue || 'Select Class'}
                                    </button>

                                    {openClass && (
                                        <ul className="dropdownList">
                                            {classes.map((cls) => (
                                                <li
                                                    key={cls.id}
                                                    className="dropdownItem"
                                                    onClick={() => {
                                                        setClassValue(cls.name);
                                                        setClassId(cls.id);
                                                        setOpenClass(false);
                                                    }}
                                                >
                                                    {cls.name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
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
                            <h4>Workout List</h4>
                            <div className="workout-items hide-scrollbar">
                                {movements.map((m) => (
                                    <div key={m.id} className="workout-item">
                                        {m.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="right-section">
                    <h3>Class Type</h3>

                    {renderCategoryBox('boxing', 'Boxing', boxingMovements)}
                    {renderCategoryBox('kickboxing', 'Kickboxing', kickboxingMovements)}
                    {renderCategoryBox('hiit', 'HIIT', hiitMovements)}
                </div>
            </div>

            <div className="button-group">
                <button type="button" className="btn cancel" onClick={handleCancel}>
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn create"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Creating...' : 'Create'}
                </button>
            </div>

            {/* Modal */}
            {showPopup && (
                <div className="modal-overlay" onClick={closePopup}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                Select {currentCategory ? currentCategory.toUpperCase() : ''}{' '}
                                Movements
                            </h3>
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
                                        Selected: {tempSelected.length}/{MAX_MOVEMENTS_PER_CATEGORY}
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
                                                        alt={m.name}
                                                        className="movement-thumb"
                                                    />
                                                    <p>{m.name}</p>
                                                    <small>
                                                        {m.duration
                                                            ? `${m.duration}s`
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

// 'use client';

// import React, { useEffect, useState } from 'react';
// import toast from 'react-hot-toast';
// import './CreateWorkout.css';

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

// const CreateWorkout: React.FC = () => {
//     const [openLocation, setOpenLocation] = useState(false);
//     const [locationValue, setLocationValue] = useState('Lakewood');

//     const [openClass, setOpenClass] = useState(false);
//     const [classValue, setClassValue] = useState('Fitness Kickboxing');

//     const locationOptions = ['Lakewood', 'Orange', 'Downey'];
//     const classOptions = ['Fitness Kickboxing', 'Power Kickboxing', 'Jobo Kickboxing'];

//     const [name, setName] = useState('');
//     const [description, setDescription] = useState('');
//     const [location, setLocation] = useState('');
//     const [focus, setFocus] = useState('');
//     const [movements, setMovements] = useState<Movement[]>([]);
//     const [boxingMovements, setBoxingMovements] = useState<SelectedMovement[]>([]);
//     const [kickboxingMovements, setKickboxingMovements] = useState<SelectedMovement[]>([]);
//     const [hiitMovements, setHiitMovements] = useState<SelectedMovement[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [showPopup, setShowPopup] = useState(false);
//     const [currentCategory, setCurrentCategory] = useState<'boxing' | 'kickboxing' | 'hiit' | null>(
//         null,
//     );
//     const [tempSelected, setTempSelected] = useState<SelectedMovement[]>([]);
//     const [workoutClass, setworkoutClass] = useState('');

//     const MAX_MOVEMENTS_PER_CATEGORY = 5;

//     const openPopup = (category: 'boxing' | 'kickboxing' | 'hiit') => {
//         setCurrentCategory(category);
//         const existingSelections =
//             category === 'boxing'
//                 ? boxingMovements
//                 : category === 'kickboxing'
//                   ? kickboxingMovements
//                   : hiitMovements;
//         setTempSelected([...existingSelections]);
//         setShowPopup(true);
//     };

//     const closePopup = () => {
//         setShowPopup(false);
//         setCurrentCategory(null);
//         setTempSelected([]);
//     };

//     const toggleTempSelection = (movement: Movement) => {
//         setTempSelected((prev) => {
//             const exists = prev.find((m) => m.id === movement.id);
//             if (exists) {
//                 return prev.filter((m) => m.id !== movement.id);
//             } else {
//                 if (prev.length >= MAX_MOVEMENTS_PER_CATEGORY) {
//                     setTimeout(() => {
//                         toast.error(
//                             `Maximum ${MAX_MOVEMENTS_PER_CATEGORY} movements allowed per category`,
//                         );
//                     }, 0);
//                     return prev;
//                 }
//                 return [...prev, { ...movement, order: prev.length + 1 }];
//             }
//         });
//     };

//     const saveSelection = () => {
//         if (!currentCategory) return;

//         if (currentCategory === 'boxing') {
//             setBoxingMovements(tempSelected);
//         } else if (currentCategory === 'kickboxing') {
//             setKickboxingMovements(tempSelected);
//         } else {
//             setHiitMovements(tempSelected);
//         }

//         closePopup();
//         const categoryName = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
//         toast.success(`${categoryName} movements updated`);
//     };

//     const handleMoveUp = (category: 'boxing' | 'kickboxing' | 'hiit', index: number) => {
//         if (index === 0) return;

//         const setter =
//             category === 'boxing'
//                 ? setBoxingMovements
//                 : category === 'kickboxing'
//                   ? setKickboxingMovements
//                   : setHiitMovements;

//         setter((prev) => {
//             const updated = [...prev];
//             [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
//             return updated.map((m, i) => ({ ...m, order: i + 1 }));
//         });
//     };

//     const handleMoveDown = (
//         category: 'boxing' | 'kickboxing' | 'hiit',
//         index: number,
//         length: number,
//     ) => {
//         if (index === length - 1) return;

//         const setter =
//             category === 'boxing'
//                 ? setBoxingMovements
//                 : category === 'kickboxing'
//                   ? setKickboxingMovements
//                   : setHiitMovements;

//         setter((prev) => {
//             const updated = [...prev];
//             [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
//             return updated.map((m, i) => ({ ...m, order: i + 1 }));
//         });
//     };

//     const removeMovement = (category: 'boxing' | 'kickboxing' | 'hiit', movementId: string) => {
//         const setter =
//             category === 'boxing'
//                 ? setBoxingMovements
//                 : category === 'kickboxing'
//                   ? setKickboxingMovements
//                   : setHiitMovements;

//         setter((prev) => {
//             const filtered = prev.filter((m) => m.id !== movementId);
//             return filtered.map((m, i) => ({ ...m, order: i + 1 }));
//         });
//     };

//     const handleCancel = () => {
//         setName('');
//         setDescription('');
//         setLocation('');
//         setFocus('');
//         setworkoutClass('');
//         setBoxingMovements([]);
//         setKickboxingMovements([]);
//         setHiitMovements([]);
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!name.trim()) {
//             toast.error('Workout name is required');
//             return;
//         }

//         const allMovements = [...boxingMovements, ...kickboxingMovements, ...hiitMovements];

//         if (allMovements.length === 0) {
//             toast.error('Please select at least one movement');
//             return;
//         }

//         setLoading(true);
//         try {
//             const res = await fetch('/api/admin/workout/create', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     name,
//                     description,
//                     location,
//                     focus,
//                     workoutClass,
//                     movements: allMovements.map((m, index) => ({
//                         id: m.id,
//                         order: index + 1,
//                         duration: m.duration || 30,
//                         rest_after: 30,
//                     })),
//                 }),
//             });

//             const data = await res.json();
//             if (!res.ok) throw new Error(data.error || 'Failed to create workout');

//             toast.success('Workout created successfully!');
//             handleCancel();
//         } catch (err) {
//             const message = err instanceof Error ? err.message : 'Something went wrong';
//             toast.error(message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const filteredMovements = currentCategory
//         ? movements.filter((m) => m.category.toLowerCase() === currentCategory.toLowerCase())
//         : [];

//     const renderCategoryBox = (
//         category: 'boxing' | 'kickboxing' | 'hiit',
//         title: string,
//         selectedMovements: SelectedMovement[],
//     ) => (
//         <div className="class-type-box">
//             <div className="class-header">
//                 <h4>{title}</h4>
//                 <button type="button" className="add-btn" onClick={() => openPopup(category)}>
//                     + Add
//                 </button>
//             </div>
//             <div className="movement-list">
//                 {selectedMovements.length === 0 ? (
//                     <p className="empty-text">No movements selected</p>
//                 ) : (
//                     <>
//                         <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
//                             {selectedMovements.length}/{MAX_MOVEMENTS_PER_CATEGORY} movements
//                         </p>
//                         {selectedMovements.map((m, idx) => (
//                             <div key={m.id} className="movement-item-with-controls">
//                                 <span className="movement-name">
//                                     {idx + 1}. {m.name}
//                                 </span>
//                                 <div className="movement-controls">
//                                     <button
//                                         type="button"
//                                         className="arrow-btn"
//                                         onClick={() => handleMoveUp(category, idx)}
//                                         disabled={idx === 0}
//                                         title="Move up"
//                                     >
//                                         ↑
//                                     </button>
//                                     <button
//                                         type="button"
//                                         className="arrow-btn"
//                                         onClick={() =>
//                                             handleMoveDown(category, idx, selectedMovements.length)
//                                         }
//                                         disabled={idx === selectedMovements.length - 1}
//                                         title="Move down"
//                                     >
//                                         ↓
//                                     </button>
//                                     <button
//                                         type="button"
//                                         className="remove-btn"
//                                         onClick={() => removeMovement(category, m.id)}
//                                         title="Remove"
//                                     >
//                                         ×
//                                     </button>
//                                 </div>
//                             </div>
//                         ))}
//                     </>
//                 )}
//             </div>
//         </div>
//     );

//     return (
//         <div className="create-workout-container content-admin-create-workout">
//             <h2>Create New Workout</h2>

//             <div className="workout-layout">
//                 <div className="left-section">
//                     <form className="create-workout-form" onSubmit={handleSubmit}>
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
//                                 <div className="customDropdown">
//                                     <button
//                                         type="button"
//                                         className={`dropdownBtn ${openLocation ? 'active' : ''}`}
//                                         onClick={() => setOpenLocation(!openLocation)}
//                                     >
//                                         {locationValue}
//                                     </button>

//                                     {openLocation && (
//                                         <ul className="dropdownList">
//                                             {locationOptions.map((opt) => (
//                                                 <li
//                                                     key={opt}
//                                                     className="dropdownItem"
//                                                     onClick={() => {
//                                                         setLocationValue(opt);
//                                                         setOpenLocation(false);
//                                                     }}
//                                                 >
//                                                     {opt}
//                                                 </li>
//                                             ))}
//                                         </ul>
//                                     )}
//                                 </div>
//                             </div>

//                             <div className="form-group">
//                                 <label>Class</label>
//                                 <div className="customDropdown">
//                                     <button
//                                         type="button"
//                                         className={`dropdownBtn ${openClass ? 'active' : ''}`}
//                                         onClick={() => setOpenClass(!openClass)}
//                                     >
//                                         {classValue}
//                                     </button>

//                                     {openClass && (
//                                         <ul className="dropdownList">
//                                             {classOptions.map((opt) => (
//                                                 <li
//                                                     key={opt}
//                                                     className="dropdownItem"
//                                                     onClick={() => {
//                                                         setClassValue(opt);
//                                                         setOpenClass(false);
//                                                     }}
//                                                 >
//                                                     {opt}
//                                                 </li>
//                                             ))}
//                                         </ul>
//                                     )}
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
//                             <h4>Workout List</h4>
//                             <div className="workout-items hide-scrollbar">
//                                 {movements.map((m) => (
//                                     <div key={m.id} className="workout-item">
//                                         {m.name}
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </form>
//                 </div>

//                 <div className="right-section">
//                     <h3>Class Type</h3>

//                     {renderCategoryBox('boxing', 'Boxing', boxingMovements)}
//                     {renderCategoryBox('kickboxing', 'Kickboxing', kickboxingMovements)}
//                     {renderCategoryBox('hiit', 'HIIT', hiitMovements)}
//                 </div>
//             </div>
//             <div className="button-group">
//                 <button type="button" className="btn cancel" onClick={handleCancel}>
//                     Cancel
//                 </button>
//                 <button type="submit" className="btn create" disabled={loading}>
//                     {loading ? 'Creating...' : 'Create'}
//                 </button>
//             </div>

//             {/* Modal */}
//             {showPopup && (
//                 <div className="modal-overlay" onClick={closePopup}>
//                     <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//                         <div className="modal-header">
//                             <h3>
//                                 Select {currentCategory ? currentCategory.toUpperCase() : ''}{' '}
//                                 Movements
//                             </h3>
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
//                                         Selected: {tempSelected.length}/{MAX_MOVEMENTS_PER_CATEGORY}
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
//                                                         alt={m.name}
//                                                         className="movement-thumb"
//                                                     />
//                                                     <p>{m.name}</p>
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
