import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

// async function main() {
//   const events = await prisma.event.findMany({
//     where: {
//       published: true,
//     },
//     select: {
//       name: true,
//       Branch: {
//         select: {
//           name: true,
//         },
//       },
//       Teams: {
//         select: {
//           attended: true,
//           _count: true,
//           confirmed: true,
//           TeamMembers: {
//             include: {
//               User: {
//                 include: {
//                   College: {
//                     select: {
//                       name: true,
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//   });
//   let eventData = [];
//   for (const event of events) {
//     eventData.push({
//       name: event.name,
//       branch: event.Branch.name,
//       participation: event.Teams.reduce((acc, team) => {
//         return acc + (team.attended ? team._count.TeamMembers : 0);
//       }, 0),
//     });
//   }
//   console.log(eventData.reduce((acc, event) => acc + event.participation, 0));
//   console.log(eventData);
// }

// async function getRoadies() {
//   const data = await prisma.event.findMany({
//     where: {
//       id: 26,
//     },
//     include: {
//       Teams: {
//         select: {
//           roundNo: true,
//           attended: true,
//           confirmed: true,
//           TeamMembers: {
//             include: {
//               User: {
//                 select: {
//                   id: true,
//                   name: true,
//                   email: true,
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//   });
//   console.log(data);

//   let filteredRound2 = data.filter((team) => team.Teams[0].roundNo === 2);
//   fs.writeFileSync("data.json", JSON.stringify(filteredRound2, null, 2));
// }

// getRoadies().finally(() => {
//   console.log("done");
// });

// async function getEventsParticipants() {
//   let id = 67;
//   let event = await prisma.event.findUnique({
//     where: {
//       id,
//     },
//     include: {
//       Teams: {
//         select: {
//           id: true,
//           attended: true,
//           confirmed: true,
//           TeamMembers: {
//             include: {
//               User: {
//                 select: {
//                   id: true,
//                   name: true,
//                   email: true,
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//   });
//   if (!event) {
//     console.log("Event not found");
//     return;
//   }
//   let csvready = event.Teams.map((team) => {
//     return team.TeamMembers.map((member) => {
//       return {
//         Name: member.User.name,
//         Email: member.User.email,
//         teamId: team.id,
//         "User Id": member.User.id,
//         attended: team.attended,
//         confirmed: team.confirmed,
//       };
//     });
//   });
// }

async function totalReg() {
  const roadiesParticipants = await prisma.team.findMany({
    where: {
      eventId: 70,
    },
    include: {
      TeamMembers: {
        include: {
          User: true,
        },
      },
    },
  });

  let colValues = "teamId,teamName,userId,userName,email,phoneNumber";
  roadiesParticipants.map((team) => {
    team.TeamMembers.map((user, idx) => {
      if (idx === 0) {
        const line = `${team.id},${team.name},${`INC24-${user.User.id
          .toString()
          .padStart(4, "0")
          .toString()}`}, ${user.User.name}, ${user.User.email}, ${
          user.User.phoneNumber
        }`;
        colValues += "\n" + line;
      } else {
        const line = `,,${`INC24-${user.User.id
          .toString()
          .padStart(4, "0")
          .toString()}`}, ${user.User.name}, ${user.User.email}, ${
          user.User.phoneNumber
        }`;
        colValues += "\n" + line;
      }
    });
  });
  fs.writeFileSync("bgmi.csv", colValues);
}

totalReg().catch(console.log);

// totalReg().finally(() => {
//   console.log("done");
// });

// async function externalCount(){
//   const count = await prisma.user.findMany({
//     where: {
//       NOT:{
//         collegeId:1
//       },
//       role:"PARTICIPANT"

//     },
//       select:{
//         id:true,
//         name:true,
//         email:true,
//         phoneNumber:true,
//         College:{
//           select:{
//             name:true
//           }
//         },
//         role:true,
//       }

//   });
//   console.log(count.length);
//   fs.writeFileSync("external.json", JSON.stringify(count));
// }

// externalCount().finally(()=>{
//   console.log("external count done")
// })

// async function winnerList(){
//   const winner = await prisma.winners.findMany({
//     where:{
//       type:"RUNNER_UP",
//        },
//        include:{
//         Team:{
//           include:{
//             TeamMembers:{
//               include:{
//                 User:{
//                   select:{
//                     name:true,
//                     email:true,
//                     phoneNumber:true,
//                   }
//                 }
//               }
//             }
//           }
//         }
//        }
//   })
//   console.log(winner);
//   fs.writeFileSync("winner.json", JSON.stringify(winner));
// }

// winnerList().finally(()=>{
//   console.log("Winner List done")
// })

// async function internalCount(){
//   const count = await prisma.user.findMany({
//     where: {
//       email:{contains:"incridea"},
//       NOT:{
//         role:"USER"
//       },
//     },
//       select:{
//         id:true,
//         name:true,
//         email:true,
//         phoneNumber:true,
//         College:{
//           select:{
//             name:true
//           }
//         },
//         role:true,
//       }

//   });
//   console.log(count.length);
//   fs.writeFileSync("inernalfirstyear.json", JSON.stringify(count));
// }

// internalCount().finally(()=>{
//   console.log("internal first year count done")
// })

// async function collegeWiseUserCount(){
//   const count = await prisma.college.findMany({
//     where:{
//       Users:{
//         some:{
//           role: {
//             in: ["PARTICIPANT","ORGANIZER","BRANCH_REP"]
//           }
//         }
//       }
//     },
//     select:{
//       name:true,
//       _count:{
//         select:{
//           Users:true
//         }
//       }
//     }
//   });

//   console.log(count);
//   fs.writeFileSync("collegeWiseCount.json", JSON.stringify(count));
// }

// collegeWiseUserCount().finally(()=>{
//   console.log("college wise count done")
// })

// async function participantsListEventWise(){
//   const participation = await prisma.team.findMany({
//     where: {
//       attended: true,
//     },
//     include: {
//       TeamMembers: {
//         include: {
//           User: {
//             include: {
//               College: true,
//             },
//           },
//         },
//       },
//       Event: {
//         select: {
//           name: true,
//         },
//       },
//     },
//   });
//   console.log(participation);
//   fs.writeFileSync("participants.json", JSON.stringify(participation));
// }

// participantsListEventWise().finally(()=>{
//      console.log("participants count done")
// })

// async function SDITCollegeparticipantsList() {
//   const participants = await prisma.user.findMany({
//   where:{
//     collegeId: 48,
//     role:"PARTICIPANT",

//   },
//   select:{
//     name:true,
//     email:true,
//     phoneNumber:true,
//     College:{
//       select:{
//         name:true
//       }
//     },

//   }
//   })
//    console.log(participants.length);
//    fs.writeFileSync("participants.json", JSON.stringify(participants));
// }

// SDITCollegeparticipantsList().finally(()=>{
//      console.log("participants count done")
// })

// async function getEventsParticipants() {
// const participants = await prisma.user.findMany({
// where:{
// collegeId:101,
// role:"PARTICIPANT",
// TeamMembers:{
//   some:{
//     Team:{
//       attended:true
//     }
//   }
// }
// },
// select:{
// name:true,
// email:true,
// College:{
//   select:{
//     name:true
//   },
// },
// TeamMembers:{
//   select:{
//     Team:{
//       select:{
//         attended:true,
//         confirmed:true,
//         Event:{
//           select:{
//             name:true
//           }
//         }
//       }
//     }
//   }
// }
// }
// })
//    console.log(participants.length);
//    fs.writeFileSync("participants.json", JSON.stringify(participants));
// }

// getEventsParticipants().finally(()=>{
//      console.log("participants count done")
// })

// async function getCollegeWiseParticipants() {
//   const colleges = await prisma.college.findMany();
//   const collegeCounts = [];
//   // Iterate over each college
//   for (const college of colleges) {
//     // Count the users with role 'PARTICIPANT' for the current college
//     const participants = await prisma.user.count({
//       where: {
//         collegeId: college.id,
//         role: {
//           in: ["PARTICIPANT", "ORGANIZER", "BRANCH_REP","ADMIN","JURY",],
//         },
//         TeamMembers:{
//           some:{
//             Team:{
//               attended:true
//             }
//           }
//         }
//       }
//     });

//     // Log the count for the current college
//     console.log(`${college.name}: ${participants}`);
//     collegeCounts.push({
//       college: college.name,
//       participantCount: participants
//     });
//   }
//      console.log(collegeCounts);
//     fs.writeFileSync('participant_counts.json', JSON.stringify(collegeCounts, null, 2));

//   }

//   getCollegeWiseParticipants().finally(()=>{
//        console.log("participants count done")
//   })
