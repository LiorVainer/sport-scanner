// import cron from 'node-cron';
// import { UserRepository } from '../repositories/user.repository';
// import { packageService } from '../services/package.service';
// import { PackageRepository } from '../repositories/package.repository';
// import { Timer } from '../logs/timer';
// import { ENV } from '../env/env.config';
// import {
//     InnerPackagesGenerationParamsSchema,
//     PackagesGenerationParams,
// } from '../models/packages/package-generate-params.model';
// import moment from 'moment';
// import Bluebird from 'bluebird';
// import { userSuggestedPackagesGenerationLogger } from '../logs/cron.logger';
// import { ProcessTypes } from '../models/log.model';
// import { CronTime } from 'cron-time-generator';
//
// const MAX_PACKAGES_PER_USER = ENV?.USER_SUGGESTED_PACKAGES_GENERATION_MAX_PACKAGES_PER_USER;
// const MAX_CONCURRENT_REQUESTS = ENV?.USER_SUGGESTED_PACKAGES_GENERATION_MAX_CONCURRENT_REQUESTS;
// const MAX_PRICE = ENV.USER_SUGGESTED_PACKAGES_GENERATION_MAX_PRICE;
// const MAX_PACKAGES_PER_USER_WITH_OFFSET =
//     ENV.USER_SUGGESTED_PACKAGES_GENERATION_MAX_PACKAGES_PER_USER +
//     ENV.USER_SUGGESTED_PACKAGES_GENERATION_MAX_PACKAGES_OFFSET;
//
// const schedule = ENV.NODE_ENV === 'development' ? CronTime.everyHour() : CronTime.everyFriday();
//
// /**
//  * Cron Job that runs once a day at midnight (00:00).
//  * It generates travel packages for each user based on their preferences
//  * and updates the `suggestedPackages` array in their user document.
//  */
// cron.schedule(schedule, async () => {
//     userSuggestedPackagesGenerationLogger.info('⏰ Starting daily package generation...');
//     const timer = new Timer();
//     timer.start(ProcessTypes.USER_SUGGESTED_PACKAGES_GENERATION);
//
//     try {
//         // Fetch all users with favorite teams, leagues, and home airport
//         const users = await UserRepository.find({
//             $or: [{ favoriteTeams: { $ne: [] } }, { favoriteLeagues: { $ne: [] } }],
//             homeAirport: { $ne: null },
//         }).lean();
//
//         userSuggestedPackagesGenerationLogger.info(`🔍 Found ${users.length} users eligible for package generation`, {
//             userCount: users.length,
//         });
//
//         await Bluebird.map(
//             users,
//             async (user) => {
//                 try {
//                     timer.start(`${ProcessTypes.USER_SUGGESTED_PACKAGES_GENERATION}_${user._id}`);
//
//                     if ((user.favoriteTeams.length === 0 && user.favoriteLeagues.length === 0) || !user.homeAirport) {
//                         userSuggestedPackagesGenerationLogger.warn(
//                             `⚠️ User ${user.username} is missing required preferences. Skipping generation.`,
//                             {
//                                 userId: user._id.toString(),
//                                 missing: {
//                                     favoriteTeams: user.favoriteTeams.length === 0,
//                                     favoriteLeagues: user.favoriteLeagues.length === 0,
//                                     homeAirport: !user.homeAirport,
//                                 },
//                             }
//                         );
//
//                         timer.stop(`${ProcessTypes.USER_SUGGESTED_PACKAGES_GENERATION}_${user._id}`);
//                         return;
//                     }
//
//                     const startDate = moment()
//                         .add(ENV.USER_SUGGESTED_PACKAGES_GENERATION_START_DATE_OFFSET, 'days')
//                         .startOf('day');
//
//                     const endDate = moment()
//                         .add(ENV.USER_SUGGESTED_PACKAGES_GENERATION_END_DATE_OFFSET, 'days')
//                         .endOf('day');
//
//                     const searchParams: PackagesGenerationParams = {
//                         originIATA: user.homeAirport.iataCode,
//                         price: { min: 0, max: MAX_PRICE },
//                         league:
//                             user.favoriteLeagues.length > 0
//                                 ? {
//                                       id: user.favoriteLeagues[0].id,
//                                       name: user.favoriteLeagues[0].name,
//                                   }
//                                 : undefined,
//                         teams: user.favoriteTeams.map((team) => ({
//                             id: team.id,
//                             name: team.name,
//                         })),
//                         date: {
//                             from: startDate.toDate(),
//                             to: endDate.toDate(),
//                         },
//                     };
//
//                     try {
//                         InnerPackagesGenerationParamsSchema.parse(searchParams);
//                     } catch (error) {
//                         userSuggestedPackagesGenerationLogger.error(
//                             `❌ Invalid search params for user ${user.username}`,
//                             {
//                                 userId: user._id.toString(),
//                                 validationError: error,
//                             }
//                         );
//                         timer.stop(`${ProcessTypes.USER_SUGGESTED_PACKAGES_GENERATION}_${user._id}`);
//                         return;
//                     }
//
//                     let generatedPackages = await packageService.generatePackages({
//                         searchParams,
//                         maxAmountOfPackages: MAX_PACKAGES_PER_USER_WITH_OFFSET,
//                     });
//
//                     if (generatedPackages.length > MAX_PACKAGES_PER_USER) {
//                         generatedPackages = generatedPackages.slice(0, MAX_PACKAGES_PER_USER);
//                     }
//
//                     if (generatedPackages.length === 0) {
//                         userSuggestedPackagesGenerationLogger.warn(
//                             `⚠️ No packages generated for user ${user.username}`,
//                             {
//                                 userId: user._id.toString(),
//                                 searchParams,
//                             }
//                         );
//                         timer.stop(`${ProcessTypes.USER_SUGGESTED_PACKAGES_GENERATION}_${user._id}`);
//                         return;
//                     }
//
//                     const savedPackages = await PackageRepository.insertMany(generatedPackages);
//
//                     await UserRepository.updateOne(
//                         { _id: user._id },
//                         {
//                             $set: { suggestedPackages: savedPackages.map((pkg) => pkg._id.toString()) },
//                         }
//                     );
//
//                     userSuggestedPackagesGenerationLogger.info(
//                         `✅ Successfully generated and saved suggested packages for user ${user.username}`,
//                         {
//                             user,
//                             numberOfPackages: savedPackages.length,
//                         }
//                     );
//
//                     timer.stop(`${ProcessTypes.USER_SUGGESTED_PACKAGES_GENERATION}_${user._id}`);
//                 } catch (error) {
//                     userSuggestedPackagesGenerationLogger.error(
//                         `❌ Error during generating suggested packages for user ${user.username}`,
//                         {
//                             user,
//                             error,
//                         }
//                     );
//                 }
//             },
//             { concurrency: MAX_CONCURRENT_REQUESTS }
//         );
//     } catch (error) {
//         userSuggestedPackagesGenerationLogger.error('❌ Error during package generation', {
//             error,
//         });
//     } finally {
//         timer.stop(ProcessTypes.USER_SUGGESTED_PACKAGES_GENERATION);
//         userSuggestedPackagesGenerationLogger.info(
//             '🛑 Daily generation of suggested packages for user has been completed',
//             {
//                 totalDuration: timer.stepDuration(ProcessTypes.USER_SUGGESTED_PACKAGES_GENERATION),
//             }
//         );
//     }
// });
