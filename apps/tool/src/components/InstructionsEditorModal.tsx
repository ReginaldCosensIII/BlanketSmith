import React, { useState, useEffect } from 'react';
import { Modal, Button } from './ui/SharedComponents';
import { InstructionDoc } from '../types';

interface InstructionsEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    doc: InstructionDoc | null | undefined;
    onSave: (doc: InstructionDoc) => void;
}

export const InstructionsEditorModal: React.FC<InstructionsEditorModalProps> = ({
    isOpen,
    onClose,
    doc,
    onSave
}) => {
    // Local state for the JSON content
    const [jsonContent, setJsonContent] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Initialize state when doc changes or modal opens
    useEffect(() => {
        if (doc) {
            setJsonContent(JSON.stringify(doc, null, 2));
        } else {
            // Default starter doc if none provided
            const starterDoc: InstructionDoc = {
                title: "Pattern Instructions",
                blocks: [
                    { type: 'heading', content: ["General Notes"] },
                    { type: 'paragraph', content: ["Enter your instructions here..."] }
                ]
            };
            setJsonContent(JSON.stringify(starterDoc, null, 2));
        }
        setError(null);
    }, [doc, isOpen]);

    const handleSave = () => {
        try {
            const parsed = JSON.parse(jsonContent);
            // Basic validation
            if (typeof parsed !== 'object' || !parsed.blocks) {
                throw new Error("Invalid format: Root must be an object with a 'blocks' array.");
            }
            onSave(parsed as InstructionDoc);
            onClose();
        } catch (err: any) {
            setError(err.message || "Invalid JSON");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Instructions"
            footer={
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>Save Changes</Button>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                <strong>Stub Editor (Commit 3):</strong>
                                <br />
                                A full Rich Text Editor is coming in Commit 4.
                                <br />
                                For now, please edit the raw JSON structure below to prove persistence works.
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instruction Document (JSON)
                    </label>
                    <textarea
                        className="w-full h-64 font-mono text-xs border rounded p-2"
                        value={jsonContent}
                        onChange={(e) => setJsonContent(e.target.value)}
                    />
                    {error && (
                        <p className="text-red-600 text-xs mt-1">{error}</p>
                    )}
                </div>
            </div>
        </Modal>
    );
};
