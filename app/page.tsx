"use client"

import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

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

  useEffect(() => {
    const saved = localStorage.getItem('teamMembers')
    if (saved) {
      setTeamMembers(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers))
  }, [teamMembers])

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
      setQuestionHistory([
        ...questionHistory,
        {
          date: new Date().toLocaleDateString(),
          question: previousQuestion,
          rating: rating
        }
      ])
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
          <Button className="bg-[#14162C] text-white hover:bg-[#14162C]/90">
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
          <div className="flex items-center gap-2">
            <Button
              className="bg-[#14162C] text-white hover:bg-[#14162C]/90"
              onClick={handleGenerateOrder}
            >
              Generate Order
            </Button>
            {activeQuestion && randomOrder.length > 0 && (
              <>
                {showCopied && (   
                  <span className="text-green-600 text-sm">✓ Copied!</span>
                )}
                <Button
                  className="bg-[#14162C] text-white hover:bg-[#14162C]/90 flex items-center gap-2"
                  onClick={handleCopyToClipboard}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copy to Clipboard
                </Button>
              </>
            )}
          </div>
        </div>
        
        {activeQuestion ? (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-md space-y-2">
              <p className="font-bold">- - - Monday's Question - - -</p>
              <p className="font-bold italic">{activeQuestion}</p>
            </div>
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
            max="5"
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
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.question}</TableCell>
                <TableCell>{item.rating}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    className="text-gray-600 hover:text-gray-900"
                    onClick={() => {
                      setQuestionHistory(questionHistory.filter((_, i) => i !== index))
                    }}
                  >
                    Delete
                  </Button>
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