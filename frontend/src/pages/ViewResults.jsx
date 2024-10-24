// import React, { useEffect, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import './ViewResults.css'; // Import the CSS file for styling

// const ViewResults = () => {
//   const [students, setStudents] = useState([]);
//   const [error, setError] = useState('');
//   const [saveStatus, setSaveStatus] = useState(''); // To show save success/error
//   const { examId } = useParams();  // Retrieve examId from the route params
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchResults = async () => {
//       try {
//         const token = localStorage.getItem('token');

//         const response = await fetch(`http://localhost:3000/view-results/${examId}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (response.ok) {
//           const data = await response.json();
//           setStudents(data.students);
//         } else {
//           setError('Error fetching results');
//         }
//       } catch (err) {
//         setError('Failed to fetch results: ' + err.message);
//       }
//     };

//     fetchResults();
//   }, [examId]);

//   const handleInputChange = (index, field, value) => {
//     const updatedStudents = [...students];
//     updatedStudents[index][field] = value; // Update the grade or reasonForGrade
//     setStudents(updatedStudents);
//   };

//   const handleSave = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`http://localhost:3000/update-grades/${examId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ students }),
//       });

//       if (response.ok) {
//         setSaveStatus('Grades updated successfully!');
//       } else {
//         setSaveStatus('Failed to update grades.');
//       }
//     } catch (err) {
//       setSaveStatus('Error: ' + err.message);
//     }
//   };

//   const handleBack = () => {
//     navigate(-1); // Navigate back to the previous page
//   };

//   return (
//     <div className="view-results-page container mx-auto p-6 bg-white rounded-lg shadow-lg">
//       <header className="flex justify-between items-center mb-8">
//         <h2 className="text-3xl font-bold text-gray-800">View and Edit Results</h2>
//         <button
//           className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition-all duration-300"
//           onClick={handleBack}
//         >
//           Back
//         </button>
//       </header>

//       {error && <p className="text-red-500 mb-4">{error}</p>}
//       {saveStatus && <p className="text-green-500 mb-4">{saveStatus}</p>}

//       <table className="min-w-full bg-white border-collapse">
//         <thead>
//           <tr className="bg-gray-100">
//             <th className="py-3 px-6 border-b-2 text-left text-gray-600">Student Name</th>
//             <th className="py-3 px-6 border-b-2 text-left text-gray-600">Grade</th>
//             <th className="py-3 px-6 border-b-2 text-left text-gray-600">Reason for Grade</th>
//           </tr>
//         </thead>
//         <tbody>
//           {students.length > 0 ? (
//             students.map((student, index) => (
//               <tr key={student.studentId} className="hover:bg-gray-50 transition-all">
//                 <td className="py-3 px-6 border-b">{student.studentName}</td>
//                 <td className="py-3 px-6 border-b">
//                   <input
//                     type="text"
//                     value={student.grade}
//                     onChange={(e) => handleInputChange(index, 'grade', e.target.value)}
//                     className="border border-gray-300 p-2 rounded"
//                   />
//                 </td>
//                 <td className="py-3 px-6 border-b">
//                   <input
//                     type="text"
//                     value={student.reasonForGrade}
//                     onChange={(e) => handleInputChange(index, 'reasonForGrade', e.target.value)}
//                     className="border border-gray-300 p-2 rounded"
//                   />
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="3" className="text-center py-4 text-gray-500">
//                 No results available
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       <button
//         onClick={handleSave}
//         className="bg-green-500 text-white py-2 px-4 mt-6 rounded hover:bg-green-700 transition-all duration-300"
//       >
//         Save Changes
//       </button>
//     </div>
//   );
// };

// export default ViewResults;
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ViewResults.css'; // Import the CSS file for styling

const ViewResults = () => {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState(''); // To show save success/error
  const { examId } = useParams();  // Retrieve examId from the route params
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(`http://localhost:3000/view-results/${examId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStudents(data.students);  // Set students' data
        } else {
          setError('Error fetching results');
        }
      } catch (err) {
        setError('Failed to fetch results: ' + err.message);
      }
    };

    fetchResults();
  }, [examId]);

  const handleInputChange = (index, field, value) => {
    const updatedStudents = [...students];
    updatedStudents[index][field] = value; // Update the grade or reasonForGrade in the array
    setStudents(updatedStudents);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/update-grades/${examId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ students }),  // Send updated students array
      });

      if (response.ok) {
        setSaveStatus('Grades updated successfully!');
      } else {
        setSaveStatus('Failed to update grades.');
      }
    } catch (err) {
      setSaveStatus('Error: ' + err.message);
    }
  };

  const handleBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div className="view-results-page container mx-auto p-6 bg-white rounded-lg shadow-lg">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">View and Edit Results</h2>
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition-all duration-300"
          onClick={handleBack}
        >
          Back
        </button>
      </header>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {saveStatus && <p className="text-green-500 mb-4">{saveStatus}</p>}

      <table className="min-w-full bg-white border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-3 px-6 border-b-2 text-left text-gray-600">Student Name</th>
            <th className="py-3 px-6 border-b-2 text-left text-gray-600">Grade</th>
            <th className="py-3 px-6 border-b-2 text-left text-gray-600">Reason for Grade</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((student, index) => (
              <tr key={student.studentId || index} className="hover:bg-gray-50 transition-all">
                <td className="py-3 px-6 border-b">{student.studentName}</td>
                <td className="py-3 px-6 border-b">
                  <input
                    type="text"
                    value={student.grade}
                    onChange={(e) => handleInputChange(index, 'grade', e.target.value)}
                    className="border border-gray-300 p-2 rounded"
                  />
                </td>
                <td className="py-3 px-6 border-b">
                  <input
                    type="text"
                    value={student.reasonForGrade}
                    onChange={(e) => handleInputChange(index, 'reasonForGrade', e.target.value)}
                    className="border border-gray-300 p-2 rounded"
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center py-4 text-gray-500">
                No results available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <button
        onClick={handleSave}
        className="bg-green-500 text-white py-2 px-4 mt-6 rounded hover:bg-green-700 transition-all duration-300"
      >
        Save Changes
      </button>
    </div>
  );
};

export default ViewResults;
