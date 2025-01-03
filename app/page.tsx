"use client"

import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import OpenAI from 'openai'

type HistoryItem = {
  question: string;
  rating: string;
}

export default function Page() {
  const [showCopied, setShowCopied] = useState(false)
  const [activeQuestion, setActiveQuestion] = useState<string>("")
  const [selectedQuestion, setSelectedQuestion] = useState<string>("")
  const [teamMembers, setTeamMembers] = useState<string[]>([])
  const [newTeamMember, setNewTeamMember] = useState("")
  const [previousQuestion, setPreviousQuestion] = useState("")
  const [rating, setRating] = useState("5")
  const [randomOrder, setRandomOrder] = useState<string[]>([])
  const [questionHistory, setQuestionHistory] = useState<Array<{
    date: string;
    question: string;
    rating: string;
  }>>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    date: '',
    question: '',
    rating: ''
  })

  useEffect(() => {
    const saved = localStorage.getItem('teamMembers')
    if (saved) {
      setTeamMembers(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers))
  }, [teamMembers])

  useEffect(() => {
    console.log('questionHistory:', questionHistory)
  }, [questionHistory])

  useEffect(() => {
    if (questionHistory.length === 0) {
      setQuestionHistory([
        {
          date: '30/12/2024',
          question: 'test question',
          rating: '5'
        }
      ])
    }
  }, [])

  useEffect(() => {
    const savedHistory = localStorage.getItem('questionHistory')
    if (savedHistory) {
      setQuestionHistory(JSON.parse(savedHistory))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('questionHistory', JSON.stringify(questionHistory))
  }, [questionHistory])

  const handleAddTeamMember = () => {
    if (newTeamMember.trim()) {
      setTeamMembers([...teamMembers, newTeamMember.trim()])
      setNewTeamMember("")
    }
  }

  const handleUseSelectedQuestion = () => {
    if (selectedQuestion) {
      setActiveQuestion(selectedQuestion)
    }
  }

  const questions = [
    "What's the most ridiculous thing you believed as a child?",
    "If you could have dinner with any historical figure, who would it be and why?",
    "What's the strangest talent you have?"
  ]

  const handleAddToHistory = () => {
    if (previousQuestion.trim()) {
      const newEntry = {
        date: new Date().toLocaleDateString(),
        question: previousQuestion.trim(),
        rating: rating
      }
      
      const updatedHistory = [...questionHistory, newEntry]
      setQuestionHistory(updatedHistory)
      setPreviousQuestion("")
    }
  }

  const handleGenerateOrder = () => {
    const shuffled = [...teamMembers].sort(() => Math.random() - 0.5)
    setRandomOrder(shuffled)
  }

  const handleCopyToClipboard = () => {
    const questionHeader = "- - - Monday's Question - - -"
    const formattedText = `${questionHeader}\n${activeQuestion}\n\n${randomOrder.join('\n')}`
    
    navigator.clipboard.writeText(formattedText)
      .then(() => {
        setShowCopied(true)
        setTimeout(() => setShowCopied(false), 2000)
      })
      .catch(err => {
        console.error('Failed to copy text: ', err)
      })
  }

  const generateNewQuestions = async () => {
    try {
      const topQuestions = questionHistory
        .sort((a, b) => Number(b.rating) - Number(a.rating))
        .slice(0, 3)
        .map(item => item.question)

      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      })

      const prompt = `Generate 3 fun, engaging ice-breaker questions for a team meeting.
      The questions should be similar in style to these highly-rated examples:
      ${topQuestions.join('\n')}
      
      The questions should:
      - Be open-ended
      - Encourage storytelling and discussion
      - Be light-hearted and fun
      - Generate laughter and engagement
      - Be appropriate for a work environment
      
      Return only the 3 questions, one per line.`

      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-3.5-turbo",
      })

      const newQuestions = completion.choices[0].message.content?.split('\n') || []
      setQuestions(newQuestions)

    } catch (error) {
      console.error('Error generating questions:', error)
      setQuestions([
        "If you could instantly master any skill, what would it be and why?",
        "What's the most interesting thing you've learned in the last week?",
        "If you could trade places with anyone for a day, who would it be?"
      ])
    }
  }

  console.log('Component rendering, questionHistory:', questionHistory);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Monday Questions</h1>

      {/* Question Options */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Question Options</h2>
        <RadioGroup value={selectedQuestion} onValueChange={setSelectedQuestion} className="space-y-4">
          {questions.map((question, index) => (
            <div key={index} className="flex items-center space-x-3">
              <RadioGroupItem value={question} id={`question-${index}`} />
              <Label className="text-base font-normal" htmlFor={`question-${index}`}>
                {question}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <div className="flex justify-between mt-6">
          <Button
            className="bg-[#14162C] text-white hover:bg-[#14162C]/90"
            onClick={generateNewQuestions}
          >
            Generate New Questions
          </Button>
          <Button
            variant="outline"
            className="border-[#14162C] text-[#14162C]"
            onClick={handleUseSelectedQuestion}
          >
            Use Selected Question
          </Button>
        </div>
      </div>

      {/* Answer Order */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Answer Order</h2>
          {activeQuestion && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-[#14162C] text-[#14162C]"
                onClick={handleCopyToClipboard}
              >
                {showCopied ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
              <Button
                className="bg-[#14162C] text-white hover:bg-[#14162C]/90"
                onClick={handleGenerateOrder}
              >
                Generate Order
              </Button>
            </div>
          )}
        </div>

        {activeQuestion ? (
          <div className="space-y-4">
            <p className="font-bold">- - - Monday's Question - - -</p>
            <p className="font-bold italic">{activeQuestion}</p>
            {randomOrder.length > 0 && (
              <div className="space-y-2">
                {randomOrder.map((member, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md">
                    {member}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 italic">Select a question above to generate answer order</p>
        )}
      </div>

      {/* Question History */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Question History</h2>
        <div className="flex gap-4 mb-6">
          <Input 
            placeholder="Enter previous question"
            value={previousQuestion}
            onChange={(e) => setPreviousQuestion(e.target.value)}
            className="flex-1"
          />
          <Input 
            type="number"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            min="1"
            max="10"
            className="w-20"
          />
          <Button 
            className="bg-[#14162C] text-white hover:bg-[#14162C]/90"
            onClick={handleAddToHistory}
          >
            Add to History
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-600">Date</TableHead>
              <TableHead className="text-gray-600">Question</TableHead>
              <TableHead className="text-gray-600">Rating</TableHead>
              <TableHead className="text-gray-600">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questionHistory.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  {editingId === index ? (
                    <Input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      className="w-32"
                    />
                  ) : (
                    item.date
                  )}
                </TableCell>
                <TableCell>
                  {editingId === index ? (
                    <Input
                      value={editForm.question}
                      onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                    />
                  ) : (
                    item.question
                  )}
                </TableCell>
                <TableCell>
                  {editingId === index ? (
                    <Input
                      type="number"
                      value={editForm.rating}
                      onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                      min="1"
                      max="10"
                      className="w-20"
                    />
                  ) : (
                    item.rating
                  )}
                </TableCell>
                <TableCell>
                  {editingId === index ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          const updatedHistory = [...questionHistory];
                          updatedHistory[index] = editForm;
                          setQuestionHistory(updatedHistory);
                          setEditingId(null);
                        }}
                        className="bg-[#14162C] text-white hover:bg-[#14162C]/90"
                      >
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div 
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setEditingId(index);
                        setEditForm({
                          date: item.date,
                          question: item.question,
                          rating: item.rating
                        });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setEditingId(index);
                          setEditForm({
                            date: item.date,
                            question: item.question,
                            rating: item.rating
                          });
                        }
                      }}
                      className="cursor-pointer p-2 hover:bg-gray-100 rounded-sm inline-flex items-center justify-center"
                    >
                      <span className="text-lg">✎</span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-4">Team Members</h2>
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Add team member name"
            value={newTeamMember}
            onChange={(e) => setNewTeamMember(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddTeamMember();
              }
            }}
          />
          <Button 
            className="bg-[#14162C] text-white hover:bg-[#14162C]/90"
            onClick={handleAddTeamMember}
          >
            Add
          </Button>
        </div>

        {/* List of team members */}
        {teamMembers.length > 0 && (
          <div className="space-y-2">
            {teamMembers.map((member, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <span>{member}</span>
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-red-600 p-2 h-auto"
                  onClick={() => {
                    setTeamMembers(teamMembers.filter((_, i) => i !== index));
                  }}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 

