import React from 'react';

const Skeleton = ({ type, className = '' }) => {
    const classes = `skeleton skeleton-${type} ${className}`;
    return <div className={classes}></div>;
};

export default Skeleton;
