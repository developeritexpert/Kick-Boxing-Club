'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
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
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [focus, setFocus] = useState('');
    const [movements, setMovements] = useState<Movement[]>([]);
    const [boxingMovements, setBoxingMovements] = useState<SelectedMovement[]>([]);
    const [kickboxingMovements, setKickboxingMovements] = useState<SelectedMovement[]>([]);
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<'boxing' | 'kickboxing' | null>(null);
    const [tempSelected, setTempSelected] = useState<SelectedMovement[]>([]);

    useEffect(() => {
        const fetchMovements = async () => {
            try {
                const res = await fetch('/api/admin/movement');
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || 'Failed to load movements');
                setMovements(data.data || []);
            } catch (err) {
                console.error(err);
                const message = err instanceof Error ? err.message : 'Failed to load movements';
                toast.error(message);
            }
        };

        fetchMovements();
    }, []);

    const openPopup = (category: 'boxing' | 'kickboxing') => {
        setCurrentCategory(category);
        // Pre-load existing selections for this category
        const existingSelections = category === 'boxing'
            ? boxingMovements
            : kickboxingMovements;
        setTempSelected([...existingSelections]);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setCurrentCategory(null);
        setTempSelected([]);
    };

    const toggleTempSelection = (movement: Movement) => {
        setTempSelected(prev => {
            const exists = prev.find(m => m.id === movement.id);
            if (exists) {
                // Remove from selection
                return prev.filter(m => m.id !== movement.id);
            } else {
                // Add to selection with next order number
                return [...prev, { ...movement, order: prev.length + 1 }];
            }
        });
    };

    const saveSelection = () => {
        if (!currentCategory) return;

        if (currentCategory === 'boxing') {
            setBoxingMovements(tempSelected);
        } else {
            setKickboxingMovements(tempSelected);
        }

        closePopup();
        toast.success(`${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} movements updated`);
    };

    const handleMoveUp = (category: 'boxing' | 'kickboxing', index: number) => {
        if (index === 0) return;

        const setter = category === 'boxing' ? setBoxingMovements : setKickboxingMovements;

        setter(prev => {
            const updated = [...prev];
            [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
            return updated.map((m, i) => ({ ...m, order: i + 1 }));
        });
    };

    const handleMoveDown = (category: 'boxing' | 'kickboxing', index: number, length: number) => {
        if (index === length - 1) return;

        const setter = category === 'boxing' ? setBoxingMovements : setKickboxingMovements;

        setter(prev => {
            const updated = [...prev];
            [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
            return updated.map((m, i) => ({ ...m, order: i + 1 }));
        });
    };

    const removeMovement = (category: 'boxing' | 'kickboxing', movementId: string) => {
        const setter = category === 'boxing' ? setBoxingMovements : setKickboxingMovements;

        setter(prev => {
            const filtered = prev.filter(m => m.id !== movementId);
            return filtered.map((m, i) => ({ ...m, order: i + 1 }));
        });
    };

    const handleCancel = () => {
        setName('');
        setDescription('');
        setLocation('');
        setFocus('');
        setBoxingMovements([]);
        setKickboxingMovements([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        alert('workout saved');

        // if (!name.trim()) {
        //     toast.error('Workout name is required');
        //     return;
        // }

        // const allMovements = [...boxingMovements, ...kickboxingMovements];

        // if (allMovements.length === 0) {
        //     toast.error('Please select at least one movement');
        //     return;
        // }

        // setLoading(true);
        // try {
        //     const res = await fetch('/api/admin/workout', {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({
        //             name,
        //             description,
        //             location,
        //             focus,
        //             movements: allMovements.map((m, index) => ({
        //                 id: m.id,
        //                 order: index + 1,
        //                 duration: m.duration || 30,
        //                 rest_after: 30,
        //             })),
        //         }),
        //     });

        //     const data = await res.json();
        //     if (!res.ok) throw new Error(data.error || 'Failed to create workout');

        //     toast.success('Workout created successfully!');
        //     handleCancel();
        // } catch (err) {
        //     const message =
        //         err instanceof Error ? err.message : 'Something went wrong';
        //     toast.error(message);
        // } finally {
        //     setLoading(false);
        // }
    };

    const filteredMovements = currentCategory
        ? movements.filter(m => m.category.toLowerCase() === currentCategory.toLowerCase())
        : [];

    return (
        <div className="create-workout-container">
            <h2>Create New Workout</h2>

            <div className="workout-layout">
                {/* Left Section - Form */}
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
                                <select value={location} onChange={(e) => setLocation(e.target.value)}>
                                    <option value="">Select Location</option>
                                    <option value="studio1">Studio 1</option>
                                    <option value="studio2">Studio 2</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Class</label>
                                <select value={focus} onChange={(e) => setFocus(e.target.value)}>
                                    <option value="">Select Class</option>
                                    <option value="2vs Kickboxing">2vs Kickboxing</option>
                                </select>
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
                            <div className="workout-items">
                                <div className="workout-item">Push-Ups</div>
                                <div className="workout-item">Jab / Cross / Hook</div>
                                <div className="workout-item">SA Man</div>
                                <div className="workout-item">Jab / Cross / RHH</div>
                                <div className="workout-item">Mountain Climbers</div>
                                <div className="workout-item">Jab / Cross / LBH</div>
                            </div>
                        </div>

                        <div className="button-group">
                            <button type="button" className="btn cancel" onClick={handleCancel}>
                                Cancel
                            </button>
                            <button type="submit" className="btn create" disabled={loading}>
                                {loading ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Section - Class Type */}
                <div className="right-section">
                    <h3>Class Type</h3>

                    <div className="class-type-box">
                        <div className="class-header">
                            <h4>Boxing</h4>
                            <button
                                type="button"
                                className="add-btn"
                                onClick={() => openPopup('boxing')}
                            >
                                + Add
                            </button>
                        </div>
                        <div className="movement-list">
                            {boxingMovements.length === 0 ? (
                                <p className="empty-text">No movements selected</p>
                            ) : (
                                boxingMovements.map((m, idx) => (
                                    <div key={m.id} className="movement-item-with-controls">
                                        <span className="movement-name">
                                            {idx + 1}. {m.name}
                                        </span>
                                        <div className="movement-controls">
                                            <button
                                                type="button"
                                                className="arrow-btn"
                                                onClick={() => handleMoveUp('boxing', idx)}
                                                disabled={idx === 0}
                                                title="Move up"
                                            >
                                                ↑
                                            </button>
                                            <button
                                                type="button"
                                                className="arrow-btn"
                                                onClick={() => handleMoveDown('boxing', idx, boxingMovements.length)}
                                                disabled={idx === boxingMovements.length - 1}
                                                title="Move down"
                                            >
                                                ↓
                                            </button>
                                            <button
                                                type="button"
                                                className="remove-btn"
                                                onClick={() => removeMovement('boxing', m.id)}
                                                title="Remove"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="class-type-box">
                        <div className="class-header">
                            <h4>Kickboxing</h4>
                            <button
                                type="button"
                                className="add-btn"
                                onClick={() => openPopup('kickboxing')}
                            >
                                + Add
                            </button>
                        </div>
                        <div className="movement-list">
                            {kickboxingMovements.length === 0 ? (
                                <p className="empty-text">No movements selected</p>
                            ) : (
                                kickboxingMovements.map((m, idx) => (
                                    <div key={m.id} className="movement-item-with-controls">
                                        <span className="movement-name">
                                            {idx + 1}. {m.name}
                                        </span>
                                        <div className="movement-controls">
                                            <button
                                                type="button"
                                                className="arrow-btn"
                                                onClick={() => handleMoveUp('kickboxing', idx)}
                                                disabled={idx === 0}
                                                title="Move up"
                                            >
                                                ↑
                                            </button>
                                            <button
                                                type="button"
                                                className="arrow-btn"
                                                onClick={() => handleMoveDown('kickboxing', idx, kickboxingMovements.length)}
                                                disabled={idx === kickboxingMovements.length - 1}
                                                title="Move down"
                                            >
                                                ↓
                                            </button>
                                            <button
                                                type="button"
                                                className="remove-btn"
                                                onClick={() => removeMovement('kickboxing', m.id)}
                                                title="Remove"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Popup Modal */}
            {showPopup && (
                <div className="modal-overlay" onClick={closePopup}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                Select {currentCategory ? currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1) : ''} Movements
                            </h3>
                            <button className="close-btn" onClick={closePopup}>×</button>
                        </div>

                        <div className="modal-body">
                            {filteredMovements.length === 0 ? (
                                <p className="empty-text">No movements available for this category</p>
                            ) : (
                                <div className="movements-grid">
                                    {filteredMovements.map((m) => {
                                        const isSelected = tempSelected.some(sel => sel.id === m.id);
                                        const selectionOrder = tempSelected.findIndex(sel => sel.id === m.id);

                                        return (
                                            <div
                                                key={m.id}
                                                className={`movement-card ${isSelected ? 'selected' : ''}`}
                                                onClick={() => toggleTempSelection(m)}
                                            >
                                                {isSelected && (
                                                    <div className="selection-badge">{selectionOrder + 1}</div>
                                                )}
                                                <img
                                                    src={m.thumbnail_url || '/placeholder-thumb.png'}
                                                    alt={m.name}
                                                    className="movement-thumb"
                                                />
                                                <p>{m.name}</p>
                                                <small>{m.duration ? `${m.duration}s` : 'No duration'}</small>
                                            </div>
                                        );
                                    })}
                                </div>
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