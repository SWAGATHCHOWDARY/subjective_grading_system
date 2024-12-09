import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const TestDetails = () => {
  const { testId } = useParams();
  const [details, setDetails] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTestDetails = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/test-details/${testId}/${localStorage.getItem('userid')}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDetails(data);
        } else {
          setError('Failed to fetch test details');
        }
      } catch (err) {
        setError('Error: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTestDetails();
  }, [testId, navigate]);

  return (
    <div className="test-details-page container mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Test Details</h2>
      {loading ? (
        <p>Loading test details...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="min-w-full bg-white border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-6 border-b text-left text-gray-600">Question</th>
              <th className="py-3 px-6 border-b text-left text-gray-600">Your Answer</th>
              <th className="py-3 px-6 border-b text-left text-gray-600">Teacher Answer</th>
              <th className="py-3 px-6 border-b text-left text-gray-600">Score</th>
              <th className="py-3 px-6 border-b text-left text-gray-600">Reason</th>
            </tr>
          </thead>
          <tbody>
            {details.answers.map((q, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-all">
                <td className="py-3 px-6 border-b">{q.questionText || 'N/A'}</td>
                <td className="py-3 px-6 border-b">{q.studentAnswer || 'Not answered'}</td>
                <td className="py-3 px-6 border-b">{q.teacherAnswer || 'N/A'}</td>
                <td className="py-3 px-6 border-b">{q.score || '0'}</td>
                <td className="py-3 px-6 border-b">{q.reasonForGrade || 'No reason provided'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TestDetails;
