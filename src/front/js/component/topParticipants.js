import React from 'react';
import { useState, useEffect, useContext } from 'react';
import { Context } from '../store/appContext';
export const TopParticipants = ({ talonarioId }) => {
  const { actions } = useContext(Context);
  const [topParticipants, setTopParticipants] = useState([]);

  const getTopParticipants = async () => {
    const response = await actions.getTopParticipants(talonarioId);
    if (response) {
      setTopParticipants(response);
    }
  };

  useEffect(() => {
    if (!talonarioId) return;
    getTopParticipants();
  }, [talonarioId]);

  return (
    <div className="w-50 p-2 details my-2">
      <h3>Top 3 participantes</h3>
      <div>
        {topParticipants.map((participant, index) => (
          <div key={index}>
            {participant.email} con{' '}
            <span className="fw-bold">{participant.ticket_count} tickets</span>
          </div>
        ))}
      </div>
    </div>
  );
};
