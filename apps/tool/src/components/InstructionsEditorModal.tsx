import React, { useState, useEffect } from 'react';
import { Modal, Button, Icon } from './ui/SharedComponents';
import { AnyProject, InstructionDoc, InstructionBlock } from '../types';
import { generateCrochetInstructionDoc } from '../services/instructions/generator';

interface InstructionsEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    doc: InstructionDoc | null | undefined;
    onSave: (doc: InstructionDoc) => void;
    project: AnyProject | null; // Needed for generator
}

export const InstructionsEditorModal: React.FC<InstructionsEditorModalProps> = ({
    isOpen,
    onClose,
    doc,
    onSave,
    project
}) => {
    const [title, setTitle] = useState('');
    const [blocks, setBlocks] = useState<InstructionBlock[]>([]);

    // Initialize state
    useEffect(() => {
        if (isOpen) {
            if (doc) {
                setTitle(doc.title || '');
                setBlocks(JSON.parse(JSON.stringify(doc.blocks))); // Deep clone
            } else {
                // Default starter
                setTitle('Pattern Instructions');
                setBlocks([
                    { type: 'heading', content: ['General Notes'] },
                    { type: 'paragraph', content: ['Enter your instructions here...'] }
                ]);
            }
        }
    }, [doc, isOpen]);

    const handleSave = () => {
        // Clean up empty blocks (optional, but good for hygiene)
        const cleanBlocks = blocks.filter(b => b.content.some(line => line.trim() !== ''));

        onSave({
            title,
            blocks: cleanBlocks
        });
        onClose();
    };

    const handleGenerate = () => {
        if (!project) return;

        const hasContent = blocks.some(b => b.content.some(l => l.trim() !== ''));
        if (hasContent) {
            if (!window.confirm("This will overwrite your current instructions. Are you sure?")) {
                return;
            }
        }

        const generated = generateCrochetInstructionDoc(project);
        setTitle(generated.title || 'Pattern Instructions');
        setBlocks(generated.blocks);
    };

    const addBlock = (type: InstructionBlock['type']) => {
        setBlocks([...blocks, { type, content: [''] }]);
    };

    const updateBlockContent = (index: number, newContent: string[]) => {
        const newBlocks = [...blocks];
        newBlocks[index] = { ...newBlocks[index], content: newContent };
        setBlocks(newBlocks);
    };

    const deleteBlock = (index: number) => {
        setBlocks(blocks.filter((_, i) => i !== index));
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === blocks.length - 1) return;

        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
        setBlocks(newBlocks);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Pattern Instructions"
            footer={
                <div className="flex justify-between items-center w-full">
                    <span className="text-xs text-gray-400">
                        {blocks.length} block{blocks.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" onClick={handleSave}>Save Changes</Button>
                    </div>
                </div>
            }
        >
            <div className="space-y-6 pb-20">
                {/* Header Controls */}
                <div className="flex justify-between items-end border-b pb-4">
                    <div className="flex-1 mr-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Document Title
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., My Pattern Instructions"
                        />
                    </div>
                    {/* Generate Action */}
                    <button
                        onClick={handleGenerate}
                        disabled={!project}
                        className="flex items-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors border border-indigo-200 text-sm font-medium h-[42px]"
                        title="Generate instructions based on project data"
                    >
                        <Icon name="zap" className="w-4 h-4" />
                        Generate (v1)
                    </button>
                </div>

                {/* Blocks List */}
                <div className="space-y-4">
                    {blocks.map((block, index) => (
                        <BlockEditor
                            key={index}
                            index={index}
                            block={block}
                            isFirst={index === 0}
                            isLast={index === blocks.length - 1}
                            onChange={(content) => updateBlockContent(index, content)}
                            onDelete={() => deleteBlock(index)}
                            onMove={(dir) => moveBlock(index, dir)}
                        />
                    ))}

                    {blocks.length === 0 && (
                        <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                            No content yet. Add a block below.
                        </div>
                    )}
                </div>

                {/* Add Block Controls */}
                <div className="pt-4 border-t">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Add New ...
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <AddBlockButton icon="type" label="Heading" onClick={() => addBlock('heading')} />
                        <AddBlockButton icon="align-left" label="Paragraph" onClick={() => addBlock('paragraph')} />
                        <AddBlockButton icon="list" label="List (•)" onClick={() => addBlock('list-ul')} />
                        <AddBlockButton icon="list-ol" label="List (1.)" onClick={() => addBlock('list-ol')} />
                    </div>
                </div>
            </div>
        </Modal>
    );
};

// --- Sub-Components ---

const BlockEditor: React.FC<{
    index: number;
    block: InstructionBlock;
    isFirst: boolean;
    isLast: boolean;
    onChange: (content: string[]) => void;
    onDelete: () => void;
    onMove: (dir: 'up' | 'down') => void;
}> = ({ index, block, isFirst, isLast, onChange, onDelete, onMove }) => {
    // Determine helper text based on type
    const getHelperText = () => {
        switch (block.type) {
            case 'heading': return 'Heading Text';
            case 'paragraph': return 'Paragraph Content';
            case 'list-ul': return 'Bulleted List (One item per line)';
            case 'list-ol': return 'Numbered List (One item per line)';
        }
    };

    // Flatten content array to string for textarea
    const textValue = block.content.join('\n');

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        // Split by lines
        const lines = e.target.value.split('\n');
        onChange(lines);
    };

    return (
        <div className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow group">
            {/* Block Header / Tools */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b rounded-t-lg">
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${getTypeBadgeColor(block.type)}`}>
                        {block.type.replace('list-', '')}
                    </span>
                </div>
                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <IconButton icon="arrow-up" onClick={() => onMove('up')} disabled={isFirst} title="Move Up" />
                    <IconButton icon="arrow-down" onClick={() => onMove('down')} disabled={isLast} title="Move Down" />
                    <div className="w-px h-3 bg-gray-300 mx-1" />
                    <IconButton icon="trash-2" onClick={onDelete} className="text-red-500 hover:bg-red-50" title="Delete Block" />
                </div>
            </div>

            {/* Editor Area */}
            <div className="p-3">
                {block.type === 'heading' ? (
                    <input
                        type="text"
                        className="w-full font-bold text-lg border-b border-gray-200 focus:border-blue-500 outline-none pb-1"
                        value={textValue}
                        onChange={handleChange}
                        placeholder={getHelperText()}
                        autoFocus={textValue === ''}
                    />
                ) : (
                    <textarea
                        className="w-full min-h-[80px] text-sm resize-y outline-none block"
                        value={textValue}
                        onChange={handleChange}
                        placeholder={getHelperText()}
                        rows={block.type.startsWith('list') ? 4 : 3}
                    />
                )}
            </div>
        </div>
    );
};

const AddBlockButton: React.FC<{ icon: string, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center p-3 border rounded hover:bg-gray-50 hover:border-blue-300 transition-colors text-gray-600 hover:text-blue-600"
    >
        <Icon name={icon as any} className="w-5 h-5 mb-1" />
        <span className="text-xs font-medium">{label}</span>
    </button>
);

const IconButton: React.FC<{ icon: string, onClick: () => void, disabled?: boolean, className?: string, title?: string }> = ({
    icon, onClick, disabled, className = "", title
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`p-1 rounded hover:bg-gray-200 transition-colors ${disabled ? 'opacity-30 cursor-not-allowed' : ''} ${className}`}
    >
        <Icon name={icon as any} className="w-4 h-4" />
    </button>
);

const getTypeBadgeColor = (type: string) => {
    switch (type) {
        case 'heading': return 'bg-purple-100 text-purple-700';
        case 'paragraph': return 'bg-blue-100 text-blue-700';
        case 'list-ul': return 'bg-green-100 text-green-700';
        case 'list-ol': return 'bg-orange-100 text-orange-700';
        default: return 'bg-gray-100 text-gray-600';
    }
};
