import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Component, ReactNode } from 'react';
import classes from './base-error-boundary.module.scss';

type ErrorBoundaryState = {
    error: string | undefined;
};

type ErrorBoundaryProps = {
    children: ReactNode;
};


export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { error: undefined };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Error caught in ErrorBoundary:", error, errorInfo);
        this.setState({ error: `${error.name}: ${error.message}` });
    }


    render() {
        const { error } = this.state;
        if (error) {
            return (
                <div className={classes.container}>
                    <FontAwesomeIcon icon={faTriangleExclamation} />
                    <h1>An Error Occurred</h1>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Try Again</button>
                </div>
            );
        } else {
            return <>{this.props.children}</>;
        }
    }
}
