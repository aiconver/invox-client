import React from 'react';

interface UserControlsProps {
    onSend?: (message: string) => void;
}

const UserControls: React.FC<UserControlsProps> = ({ onSend }) => {
    const [message, setMessage] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && onSend) {
            onSend(message);
            setMessage('');
        }
    };

    return (
        <div className="chat-user-controls">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                />
                <button type="submit" className="send-button">
                    Send
                </button>
            </form>
        </div>
    );
};

export default UserControls;