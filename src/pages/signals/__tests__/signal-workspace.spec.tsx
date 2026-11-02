import { render, screen } from '@testing-library/react';
import SignalWorkspace from '../signal-workspace';

describe('Signal workspaces awaiting integration', () => {
    it('makes the premium feed integration status explicit without fake signals', () => {
        render(<SignalWorkspace premium />);
        expect(screen.getByText('AWAITING INTEGRATION')).toBeInTheDocument();
        expect(screen.getByText(/premium signal source code is being supplied separately/)).toBeInTheDocument();
        expect(screen.getByText('No sample signals or simulated results are displayed.')).toBeInTheDocument();
    });

    it('does not imply that the free signal tool is already running', () => {
        render(<SignalWorkspace />);
        expect(screen.getByText(/free signal tool is not connected yet/)).toBeInTheDocument();
        expect(screen.getByText('No signal feed connected')).toBeInTheDocument();
    });
});
