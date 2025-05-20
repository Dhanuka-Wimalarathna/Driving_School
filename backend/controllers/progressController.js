import { markSessionAsCompleted, markSessionAsNotCompleted } from '../models/progressModel.js';

export const handleSessionCompletion = (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId || isNaN(bookingId)) {
    return res.status(400).json({ message: 'Invalid booking ID' });
  }

  markSessionAsCompleted(bookingId, (err, result) => {
    if (err) {
      console.error('Error marking session completed:', err);
      return res.status(500).json({ message: 'Failed to mark session completed', error: err.message });
    }

    res.status(200).json(result);
  });
};

export const handleSessionNotCompleted = (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId || isNaN(bookingId)) {
    return res.status(400).json({ message: 'Invalid booking ID' });
  }

  markSessionAsNotCompleted(bookingId, (err, result) => {
    if (err) {
      console.error('Error marking session not completed:', err);
      return res.status(500).json({ message: 'Failed to mark session as not completed', error: err.message });
    }

    res.status(200).json(result);
  });
};
