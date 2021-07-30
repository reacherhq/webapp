import React from 'react';

export interface CardProps extends React.HTMLProps<HTMLDivElement> {
	body?: string | React.ReactChild;
	subtitle?: string | React.ReactChild;
	footer?: string | React.ReactChild;
}

export function Card({
	title,
	subtitle,
	body,
	footer,
}: CardProps): React.ReactElement {
	return (
		<div className="column col-4 col-mx-auto card">
			<div className="card-header">
				<div className="card-title">
					<h5 className="text-center">{title}</h5>
				</div>
				<div className="card-subtitle text-center">{subtitle}</div>
			</div>
			<div className="card-body">{body}</div>

			<div className="card-footer p-centered">{footer}</div>
		</div>
	);
}
